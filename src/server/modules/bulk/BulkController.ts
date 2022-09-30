import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { UploadedFile } from 'express-fileupload'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { BulkService } from './interfaces'
import { UrlManagementService } from '../user/interfaces'
import dogstatsd from '../../util/dogstatsd'
import { UrlThreatScanService } from '../threat/interfaces'

@injectable()
export class BulkController {
  private urlManagementService: UrlManagementService

  private bulkService: BulkService

  private urlThreatScanService: UrlThreatScanService

  public constructor(
    @inject(DependencyIds.bulkService)
    bulkService: BulkService,
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.urlThreatScanService)
    urlThreatScanService: UrlThreatScanService,
  ) {
    this.bulkService = bulkService
    this.urlManagementService = urlManagementService
    this.urlThreatScanService = urlThreatScanService
  }

  public bulkCreate: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const file = req.files?.file as UploadedFile | undefined
    const { userId } = req.body
    if (!file) {
      res.badRequest(jsonMessage('Unable to detect file.'))
      return
    }

    // validate csv and return long urls if valid
    const schema = this.bulkService.parseCsv(file.data.toString())
    if (!schema.isValid) {
      res.badRequest(jsonMessage('Csv is wrongly formatted.'))
      return
    }

    // safe browsing check for all long urls
    const containsMaliciousLinks = await this.urlThreatScanService.isThreatBulk(
      schema.longUrls,
    )
    if (containsMaliciousLinks) {
      res.badRequest(jsonMessage('Malicious link(s) detected.'))
      return
    }

    // generate url mappings
    const urlMappings = await this.bulkService.generateUrlMappings(
      schema.longUrls,
    )

    // bulk create
    try {
      await this.urlManagementService.bulkCreate(userId, urlMappings)
    } catch (e) {
      dogstatsd.increment('bulk.hash.failure', 1, 1)
      res.badRequest(jsonMessage('Something went wrong, please try again.'))
      return
    }

    dogstatsd.increment('bulk.hash.success', 1, 1)
    res.ok()
  }
}

export default BulkController
