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
import { StorableUrl } from '../../../repositories/types'

import { ApiUrl, UrlCreationRequest } from '.'

@injectable()
export class ApiV1Controller {
  private urlManagementService: UrlManagementService

  public constructor(
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
  ) {
    this.urlManagementService = urlManagementService
  }

  public createUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, longUrl, shortUrl }: UrlCreationRequest = req.body

    try {
      const url = await this.urlManagementService.createUrl(
        userId,
        shortUrl,
        StorableUrlSource.Api,
        longUrl,
      )
      const apiUrl = this.sanitizeUrlForApi(url)
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

  private sanitizeUrlForApi: (url: StorableUrl) => ApiUrl = (url) => {
    return {
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      state: url.state,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }
  }
}

export default ApiV1Controller
