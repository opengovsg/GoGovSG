import Express from 'express'
import { inject, injectable } from 'inversify'

import Sequelize from 'sequelize'
import { OwnershipTransferRequest, UrlCreationRequest, UrlEditRequest } from '.'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../../util/error'
import { MessageType } from '../../../shared/util/messages'
import { StorableUrlSource, StorableUrlState } from '../../repositories/enums'

import { logger } from '../../config'
import { UrlManagementService } from './interfaces/UrlManagementService'
import {
  userTagsQueryConditions,
  userUrlsQueryConditions,
} from '../../api/user/validators'
import TagManagementServiceInterface from './interfaces/TagManagementService'
import ApiKeyAuthServiceInterface from './interfaces/ApiKeyAuthServiceInterface'

type AnnouncementResponse = {
  message?: string
  title?: string
  subtitle?: string
  url?: string
  image?: string
}

@injectable()
export class UserController {
  private urlManagementService: UrlManagementService

  private readonly userMessage: string

  private readonly userAnnouncement: AnnouncementResponse

  private tagManagementService: TagManagementServiceInterface

  private apiKeyAuthService: ApiKeyAuthServiceInterface

  public constructor(
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.userMessage)
    userMessage: string,
    @inject(DependencyIds.userAnnouncement)
    userAnnouncement: AnnouncementResponse,
    @inject(DependencyIds.tagManagementService)
    tagManagementService: TagManagementServiceInterface,
    @inject(DependencyIds.apiKeyAuthService)
    apiKeyAuthService: ApiKeyAuthServiceInterface,
  ) {
    this.urlManagementService = urlManagementService
    this.userMessage = userMessage
    this.userAnnouncement = userAnnouncement
    this.tagManagementService = tagManagementService
    this.apiKeyAuthService = apiKeyAuthService
  }

  public createUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, longUrl, shortUrl, tags }: UrlCreationRequest = req.body
    const file = req.files?.file

    if (Array.isArray(file)) {
      res.unprocessableEntity(
        jsonMessage('Only single file uploads are supported.'),
      )
      return
    }

    try {
      const result = await this.urlManagementService.createUrl(
        userId,
        StorableUrlSource.Console,
        shortUrl,
        longUrl,
        file,
        tags,
      )
      res.ok(result)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
        return
      }
      if (error instanceof AlreadyExistsError) {
        const newErrorMessage = `${error.message} Click here to find out more`
        res.badRequest(jsonMessage(newErrorMessage, MessageType.ShortUrlError))
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
    const {
      userId,
      longUrl,
      shortUrl,
      state,
      description,
      contactEmail,
      tags,
    }: UrlEditRequest = req.body
    const file = req.files?.file
    if (Array.isArray(file)) {
      res.unprocessableEntity(
        jsonMessage('Only single file uploads are supported.'),
      )
      return
    }

    let urlState
    if (state) {
      urlState =
        state === 'ACTIVE' ? StorableUrlState.Active : StorableUrlState.Inactive
    }

    let newContactEmail: string | undefined | null
    if (contactEmail) {
      newContactEmail = contactEmail?.trim().toLowerCase()
    } else if (contactEmail === null) {
      newContactEmail = null
    }

    try {
      const url = await this.urlManagementService.updateUrl(userId, shortUrl, {
        longUrl,
        state: urlState,
        file,
        contactEmail: newContactEmail,
        description: description?.trim(),
        tags,
      })
      res.ok(url)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.forbidden(jsonMessage(error.message))
        return
      }
      logger.error(`Error editing URL:\t${error}`)
      res.badRequest(jsonMessage(`Unable to edit short link "${shortUrl}"`))
      return
    }
  }

  public changeOwnership: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, shortUrl, newUserEmail }: OwnershipTransferRequest =
      req.body

    try {
      const url = await this.urlManagementService.changeOwnership(
        userId,
        shortUrl,
        newUserEmail,
      )
      res.ok(url)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
        return
      }
      if (error instanceof AlreadyOwnLinkError) {
        res.badRequest(jsonMessage(error.message))
        return
      }
      logger.error(`Error transferring ownership of short URL:\t${error}`)
      res.badRequest(jsonMessage('An error has occured'))
      return
    }
  }

  public getUrlsWithConditions: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const queryConditions = UserController.extractUrlQueryConditions(req)
    const validationResult = userUrlsQueryConditions.validate(queryConditions)
    if (validationResult.error) {
      res.badRequest(jsonMessage(validationResult.error.message))
      return
    }
    // Find user and paginated urls
    try {
      const { urls, count } =
        await this.urlManagementService.getUrlsWithConditions(queryConditions)
      res.ok({ urls, count })
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
    let { limit = 1000, searchText = '' } = req.query
    limit = Math.min(1000, Number(limit))
    searchText = searchText.toString().toLowerCase()
    const {
      offset = 0,
      orderBy = 'updatedAt',
      sortDirection = 'desc',
      isFile,
      state,
      tags = '',
    } = req.query
    const tagList = tags ? tags.toString().toLowerCase().split(';') : []
    const queryConditions = {
      limit,
      offset: Number(offset),
      orderBy: orderBy.toString(),
      sortDirection: sortDirection.toString(),
      searchText,
      userId,
      state: state?.toString(),
      isFile: undefined as boolean | undefined,
      tags: tagList,
    }
    if (isFile === 'true') {
      queryConditions.isFile = true
    } else if (isFile === 'false') {
      queryConditions.isFile = false
    }
    return queryConditions
  }

  public getTagsWithConditions: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId } = req.body
    let { searchText = '' } = req.query
    const limit = 5
    searchText = searchText.toString().toLowerCase()
    const queryConditions = { searchText, userId, limit }
    const validationResult = userTagsQueryConditions.validate(queryConditions)
    if (validationResult.error) {
      res.badRequest(jsonMessage(validationResult.error.message))
      return
    }
    try {
      const tags = await this.tagManagementService.getTagsWithConditions(
        queryConditions,
      )
      res.ok(tags)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
        return
      }
      res.serverError(jsonMessage('Error retrieving Tags for user'))
      return
    }
  }

  public createAPIKey: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    try {
      const { userId } = req.body
      const apiKey = await this.apiKeyAuthService.upsertApiKey(userId)
      res.ok(jsonMessage(apiKey))
      return
    } catch (error) {
      res.serverError(jsonMessage('Error creating APIKey for user'))
      return
    }
  }

  public getUserMessage: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res.send(this.userMessage)
    return
  }

  public getUserAnnouncement: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res.send(this.userAnnouncement)
    return
  }
}

export default UserController
