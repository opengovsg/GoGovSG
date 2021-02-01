import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { logger } from '../../config'
import { UserType } from '../../models/user'

import { UrlCreationRequest } from '../user'

import { SafeBrowsingService } from './services'

@injectable()
export class UrlCheckController {
  private urlThreatScanService: Pick<
    SafeBrowsingService,
    keyof SafeBrowsingService
  >

  public constructor(
    @inject(DependencyIds.urlThreatScanService)
    urlThreatScanService: Pick<SafeBrowsingService, keyof SafeBrowsingService>,
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
