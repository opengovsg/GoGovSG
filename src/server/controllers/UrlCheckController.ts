import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../util/json'
import { UrlCheckControllerInterface } from './interfaces/UrlCheckControllerInterface'
import { UrlCreationRequest } from '../../types/server/controllers/UserController'
import { UrlThreatScanServiceInterface } from '../services/interfaces/UrlThreatScanServiceInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import { UserType } from '../models/user'

@injectable()
export class UrlCheckController implements UrlCheckControllerInterface {
  private urlThreatScanService: UrlThreatScanServiceInterface

  public constructor(
    @inject(DependencyIds.urlThreatScanService)
    urlThreatScanService: UrlThreatScanServiceInterface,
  ) {
    this.urlThreatScanService = urlThreatScanService
  }

  checkUrl: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const { shortUrl, longUrl }: UrlCreationRequest = req.body

    if (longUrl) {
      try {
        const isThreat = await this.urlThreatScanService.isThreat(longUrl)
        if (isThreat) {
          const user = req.session?.user as UserType
          logger.warn(
            `Malicious link attempt: User ${user?.id} tried to link ${shortUrl} to ${longUrl}`,
          )
          res.badRequest(
            jsonMessage(
              'Link is likely to be malicious, please contact us for further assistance',
            ),
          )
          return
        }
      } catch (error) {
        logger.error(error)
        res.serverError(jsonMessage(error.message))
        return
      }
    }
    next()
  }
}

export default UrlCheckController
