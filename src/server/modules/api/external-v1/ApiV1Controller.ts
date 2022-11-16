import Express from 'express'
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

import { UrlCreationRequest, UrlEditRequest } from '.'
import { UrlV1Mapper } from '../../../mappers/UrlV1Mapper'

@injectable()
export class ApiV1Controller {
  private urlManagementService: UrlManagementService

  private urlV1Mapper: UrlV1Mapper

  public constructor(
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.urlV1Mapper)
    urlV1Mapper: UrlV1Mapper,
  ) {
    this.urlManagementService = urlManagementService
    this.urlV1Mapper = urlV1Mapper
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
      }
      logger.error(`Error creating short URL:\t${error}`)
      res.badRequest(jsonMessage('Server error.'))
      return
    }
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
