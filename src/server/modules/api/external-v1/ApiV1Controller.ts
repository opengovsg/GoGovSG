import Express from 'express'
import { inject, injectable } from 'inversify'
import Sequelize from 'sequelize'

import { logger } from '../../../config'
import { DependencyIds } from '../../../constants'
import jsonMessage from '../../../util/json'
import { AlreadyExistsError, NotFoundError } from '../../../util/error'

import { UrlManagementService } from '../../user/interfaces'
import { MessageType } from '../../../../shared/util/messages'
import { StorableUrlSource } from '../../../repositories/enums'

import { UrlCreationRequest } from '.'
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

  private static extractUrlQueryConditions(req: Express.Request) {
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
}

export default ApiV1Controller
