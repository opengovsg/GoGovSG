import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { LinkStatisticsService } from './interfaces'
import { UserType } from '../../models/user'

@injectable()
export class LinkStatisticsController {
  private linkStatisticsService: LinkStatisticsService

  public constructor(
    @inject(DependencyIds.linkStatisticsService)
    linkStatisticsService: LinkStatisticsService,
  ) {
    this.linkStatisticsService = linkStatisticsService
  }

  public getLinkStatistics: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
      const offset = parseInt(req.query.offset as string, 10) || undefined
      const shortUrl = req.query.url as string
      if (!shortUrl) {
        res.status(404).send(jsonMessage('Short url does not exist'))
        return
      }
      const user = req.session?.user as UserType
      if (!user) {
        res.status(401).send(jsonMessage('User session does not exist'))
        return
      }
      try {
        const linkStats = await this.linkStatisticsService.getLinkStatistics(
          user.id,
          shortUrl,
          offset,
        )
        res.status(200).json(linkStats)
        return
      } catch (error) {
        res.status(404).send(jsonMessage(error.message))
        return
      }
    }
}

export default LinkStatisticsController
