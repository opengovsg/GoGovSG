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
        shortUrl,
        StorableUrlSource.Api,
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
}

export default ApiV1Controller
