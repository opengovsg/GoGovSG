import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { DependencyIds } from '../constants'
import { LinkStatisticsControllerInterface } from './interfaces/LinkStatisticsControllerInterface'
import { LinkStatisticsServiceInterface } from '../services/interfaces/LinkStatisticsServiceInterface'
import { UserType } from '../models/user'

@injectable()
export class LinkStatisticsController
  implements LinkStatisticsControllerInterface {
  private linkStatisticsService: LinkStatisticsServiceInterface

  public constructor(
    @inject(DependencyIds.linkStatisticsService)
    linkStatisticsService: LinkStatisticsServiceInterface,
  ) {
    this.linkStatisticsService = linkStatisticsService
  }

  public getLinkStatistics: (
    req: Request,
    res: Response,
  ) => Promise<void> = async (req, res) => {
    const shortUrl = req.query.url
    if (!shortUrl) res.json(null)
    const user = req.session?.user as UserType
    if (!user) res.json(null)
    const linkStats = await this.linkStatisticsService.getLinkStatistics(
      user.id,
      shortUrl,
    )
    res.json(linkStats)
  }
}

export default LinkStatisticsController
