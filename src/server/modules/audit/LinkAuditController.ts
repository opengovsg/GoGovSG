import { Request, Response } from 'express'

import { injectable } from 'inversify'

@injectable()
export class LinkAuditController {
  public getLinkAudit: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { url: shortUrl, offset, limit } = req.query
    console.log(shortUrl, offset, limit)
    res.status(200).send()
    return
  }
}

export default LinkAuditController
