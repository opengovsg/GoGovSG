import Express from 'express'
import { inject, injectable } from 'inversify'
import {
  OwnershipTransferRequest,
  UrlCreationRequest,
  UrlEditRequest,
} from '../../types/server/controllers/UserController'
import jsonMessage from '../util/json'
import { UrlManagementServiceInterface } from '../services/interfaces/UrlManagermentServiceInterface'
import { DependencyIds } from '../constants'
import { UserControllerInterface } from './interfaces/UserControllerInterface'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../util/error'
import { MessageType } from '../../shared/util/messages'
import { logger, userMessage } from '../config'
import { StorableUrlState } from '../repositories/enums'

@injectable()
export class UserController implements UserControllerInterface {
  private urlManagementService: UrlManagementServiceInterface

  public constructor(
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementServiceInterface,
  ) {
    this.urlManagementService = urlManagementService
  }

  public createUrl: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { userId, longUrl, shortUrl }: UrlCreationRequest = req.body
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
        shortUrl,
        longUrl,
        file,
      )
      res.ok(result)
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
      })
      res.ok(url)
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(jsonMessage(error.message))
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
    const {
      userId,
      shortUrl,
      newUserEmail,
    }: OwnershipTransferRequest = req.body

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
    } = req.query
    const queryConditions = {
      limit,
      offset: Number(offset),
      orderBy: orderBy.toString(),
      sortDirection: sortDirection.toString(),
      searchText,
      userId,
      state: state?.toString(),
      isFile: Boolean(isFile),
    }
    // Find user and paginated urls
    try {
      const {
        urls,
        count,
      } = await this.urlManagementService.getUrlsWithConditions(queryConditions)
      res.ok({ urls, count })
      return
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.notFound(error.message)
        return
      }
      res.serverError(jsonMessage('Error retrieving URLs for user'))
      return
    }
  }

  public getUserMessage: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res.send(userMessage)
    return
  }
}

export default UserController
