import Express from 'express'
import * as Joi from 'joi'
import { inject, injectable } from 'inversify'
import Sequelize from 'sequelize'

import { logger } from '../../../config'
import { DependencyIds } from '../../../constants'
import jsonMessage from '../../../util/json'
import {
  AlreadyExistsError,
  InvalidUrlUpdateError,
  NotFoundError,
} from '../../../util/error'

import { UrlManagementService } from '../../user/interfaces'
import { MessageType } from '../../../../shared/util/messages'
import {
  StorableUrlSource,
  StorableUrlState,
} from '../../../repositories/enums'
import { UserUrlsQueryConditions } from '../../../repositories/types'

import { UrlBulkCreationRequest, UrlCreationRequest, UrlEditRequest } from '.'
import { UrlV1Mapper } from '../../../mappers/UrlV1Mapper'
import { UrlThreatScanService } from '../../threat/interfaces'
import { urlBulkRowSchema } from '../../../api/external-v1/validators'

@injectable()
export class ApiV1Controller {
  private urlManagementService: UrlManagementService

  private urlV1Mapper: UrlV1Mapper

  private urlThreatScanService: UrlThreatScanService

  public constructor(
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.urlV1Mapper)
    urlV1Mapper: UrlV1Mapper,
    @inject(DependencyIds.urlThreatScanService)
    urlThreatScanService: UrlThreatScanService,
  ) {
    this.urlManagementService = urlManagementService
    this.urlV1Mapper = urlV1Mapper
    this.urlThreatScanService = urlThreatScanService
  }

  public createUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, longUrl, shortUrl }: UrlCreationRequest = req.body

    try {
      const url = await this.urlManagementService.createUrl(
        userId,
        StorableUrlSource.Api,
        shortUrl,
        longUrl,
      )
      const apiUrl = this.urlV1Mapper.persistenceToDto(url)
      res.ok(apiUrl)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
        return
      }
      if (error instanceof AlreadyExistsError) {
        res.badRequest(jsonMessage(error.message, MessageType.ShortUrlError))
        return
      }
      if (error instanceof Sequelize.ValidationError) {
        res.badRequest(jsonMessage(error.message))
        return
      }
      logger.error(`Error creating short URL:\t${error}`)
      res.serverError(jsonMessage('Server error.'))
      return
    }
  }

  public bulkCreateUrls: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, urls }: UrlBulkCreationRequest = req.body
    const created = []
    const errors = []
    const usedShortUrls = new Set<string>()

    /* eslint-disable no-await-in-loop, no-continue */
    for (let index = 0; index < urls.length; index += 1) {
      const row = urls[index]
      const { error, value } = urlBulkRowSchema.validate(row, {
        abortEarly: true,
      })
      if (error) {
        errors.push({
          index,
          ...ApiV1Controller.extractRowValidationError(error),
        })
        continue
      }

      const { longUrl, shortUrl } = value

      if (shortUrl && usedShortUrls.has(shortUrl)) {
        errors.push({
          index,
          message: `Short link "${shortUrl}" is already used.`,
          type: MessageType.ShortUrlError,
        })
        continue
      }

      try {
        const isThreat = await this.urlThreatScanService.isThreat(longUrl)
        if (isThreat) {
          errors.push({
            index,
            message:
              'Link is likely to be malicious, please contact us for further assistance',
          })
          continue
        }
      } catch (scanError) {
        errors.push({
          index,
          message: (scanError as Error).message,
        })
        continue
      }

      try {
        const url = await this.urlManagementService.createUrl(
          userId,
          StorableUrlSource.Api,
          shortUrl,
          longUrl,
        )
        usedShortUrls.add(url.shortUrl)
        created.push(this.urlV1Mapper.persistenceToDto(url))
      } catch (createError) {
        if (createError instanceof AlreadyExistsError) {
          errors.push({
            index,
            message: createError.message,
            type: MessageType.ShortUrlError,
          })
        } else if (createError instanceof NotFoundError) {
          errors.push({
            index,
            message: createError.message,
          })
        } else if (createError instanceof Sequelize.ValidationError) {
          errors.push({
            index,
            message: createError.message,
          })
        } else {
          logger.error(`Error creating short URL in bulk:\t${createError}`)
          errors.push({
            index,
            message: 'Server error.',
          })
        }
      }
    }
    /* eslint-enable no-await-in-loop, no-continue */

    const response = { created, errors }
    if (created.length > 0) {
      res.ok(response)
      return
    }
    res.badRequest(response)
  }

  private static extractRowValidationError(error: Joi.ValidationError): {
    message: string
    type?: MessageType
  } {
    const detail = error.details[0]
    const field = detail.path[0]
    let { message } = detail
    const customMatch = message.match(/because (.+)$/)
    if (customMatch) {
      ;[, message] = customMatch
    }

    if (field === 'shortUrl') {
      return { message, type: MessageType.ShortUrlError }
    }
    if (field === 'longUrl') {
      return { message, type: MessageType.LongUrlError }
    }
    return { message }
  }

  public getUrlsWithConditions: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const queryConditions = ApiV1Controller.extractUrlQueryConditions(req)
    // Find user and paginated urls
    try {
      const { urls, count } =
        await this.urlManagementService.getUrlsWithConditions(queryConditions)
      const apiUrls = urls.map((url) => this.urlV1Mapper.persistenceToDto(url))
      res.ok({ urls: apiUrls, count })
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
        return
      }
      res.serverError(jsonMessage('Error retrieving URLs for user'))
      return
    }
  }

  private static extractUrlQueryConditions(
    req: Express.Request,
  ): UserUrlsQueryConditions {
    const { userId } = req.body
    const {
      limit = 1000,
      offset = 0,
      searchText = '',
      orderBy = 'createdAt',
      sortDirection = 'desc',
      isFile,
      state,
    } = req.query
    const queryConditions = {
      userId,
      limit: Number(limit),
      offset: Number(offset),
      orderBy: orderBy.toString(),
      sortDirection: sortDirection.toString(),
      searchText: searchText.toString(),
      state: state?.toString(),
      isFile: isFile as boolean | undefined,
    }
    return queryConditions
  }

  public updateUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, longUrl, shortUrl, state }: UrlEditRequest = req.body

    let urlState
    if (state) {
      urlState =
        state === 'ACTIVE' ? StorableUrlState.Active : StorableUrlState.Inactive
    }

    try {
      const url = await this.urlManagementService.updateUrl(userId, shortUrl, {
        longUrl,
        state: urlState,
      })
      const apiUrl = this.urlV1Mapper.persistenceToDto(url)
      res.ok(apiUrl)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.forbidden(jsonMessage(error.message))
        return
      }
      if (error instanceof InvalidUrlUpdateError) {
        res.badRequest(jsonMessage(error.message))
        return
      }
      logger.error(`Error editing URL:\t${error}`)
      res.badRequest(jsonMessage(`Unable to edit short link "${shortUrl}"`))
      return
    }
  }
}

export default ApiV1Controller
