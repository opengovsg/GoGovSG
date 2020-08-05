import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../util/json'
import { UrlCheckControllerInterface } from './interfaces/UrlCheckControllerInterface'
import { UrlCreationRequest } from '../../types/server/controllers/UserController'
import { UrlThreatScanServiceInterface } from '../services/interfaces/UrlThreatScanServiceInterface'
import { DependencyIds } from '../constants'

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
    const { longUrl }: UrlCreationRequest = req.body

    if (longUrl) {
      try {
        const isThreat = await this.urlThreatScanService.isThreat(longUrl)
        if (isThreat) {
          res.badRequest(jsonMessage('Link is likely to be malicious.'))
          return
        }
      } catch (error) {
        res.serverError(jsonMessage(error.message))
        return
      }
    }
    next()
  }
}

export default UrlCheckController
