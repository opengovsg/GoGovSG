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
import { UrlV2Mapper } from '../../../mappers/UrlV2Mapper'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'

@injectable()
export class ApiV2Controller {
  private userRepository: UserRepositoryInterface

  private urlManagementService: UrlManagementService

  private urlV2Mapper: UrlV2Mapper

  public constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.urlV2Mapper)
    urlV2Mapper: UrlV2Mapper,
  ) {
    this.userRepository = userRepository
    this.urlManagementService = urlManagementService
    this.urlV2Mapper = urlV2Mapper
  }

  public createUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, shortUrl, longUrl, email }: UrlCreationRequest = req.body

    if (email) {
      try {
        await this.userRepository.findOrCreateWithEmail(email)
      } catch (error) {
        logger.error(`Error creating user:\t ${email}, ${error}`)
        res.badRequest(jsonMessage('Error creating new user.'))
        return
      }
    }

    try {
      const newUrl = await this.urlManagementService.createUrl(
        userId,
        StorableUrlSource.Api,
        shortUrl,
        longUrl,
      )
      if (email) {
        await this.urlManagementService.changeOwnership(
          userId,
          newUrl.shortUrl,
          email,
        )
      }
      const apiUrl = this.urlV2Mapper.persistenceToDto(newUrl)
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

export default ApiV2Controller
