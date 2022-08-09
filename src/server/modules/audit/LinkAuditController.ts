import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { LinkAuditService } from './interfaces'
import { DependencyIds } from '../../constants'
import jsonMessage from '../../util/json'

@injectable()
export class LinkAuditController {
  private linkAuditService: LinkAuditService

  public constructor(
    @inject(DependencyIds.linkAuditService)
    linkAuditService: LinkAuditService,
  ) {
    this.linkAuditService = linkAuditService
  }

  public getLinkAudit: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { url, offset, limit } = req.query
    const shortUrl = url as string
    if (!shortUrl) {
      res.status(404).send(jsonMessage('Short url does not exist'))
      return
    }
    const user = req.session?.user
    if (!user) {
      res.status(401).send(jsonMessage('User session does not exist'))
      return
    }
    try {
      const linkStats = await this.linkAuditService.getLinkAudit(
        user.id,
        shortUrl,
        parseInt(limit as string, 10) || undefined,
        parseInt(offset as string, 10) || undefined,
      )
      res.status(200).json(linkStats)
      return
    } catch (error) {
      res.status(404).send(jsonMessage(error.message))
      return
    }
  }
}

export default LinkAuditController
