import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { UploadedFile } from 'express-fileupload'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { BulkService } from './interfaces'
import { UrlManagementService } from '../user/interfaces'
import dogstatsd from '../../util/dogstatsd'

@injectable()
export class BulkController {
  private urlManagementService: UrlManagementService

  private bulkService: BulkService

  public constructor(
    @inject(DependencyIds.bulkService)
    bulkService: BulkService,
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
  ) {
    this.bulkService = bulkService
    this.urlManagementService = urlManagementService
  }

  public validateAndParseCsv: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const file = req.files?.file as UploadedFile | undefined
    if (!file) {
      res.badRequest(jsonMessage('Unable to detect file.'))
      return
    }

    const schema = this.bulkService.parseCsv(file)
    if (!schema.isValid) {
      res.badRequest(jsonMessage('Csv is wrongly formatted.'))
      return
    }
    // put longUrls on the req body so that it can be used by other controllers
    req.body.longUrls = schema.longUrls
    next()
  }

  public bulkCreate: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { userId, longUrls } = req.body
    // generate url mappings

    const urlMappings = await this.bulkService.generateUrlMappings(longUrls)
    // bulk create
    try {
      await this.urlManagementService.bulkCreate(userId, urlMappings)
    } catch (e) {
      dogstatsd.increment('bulk.hash.failure', 1, 1)
      res.badRequest(jsonMessage('Something went wrong, please try again.'))
      return
    }

    dogstatsd.increment('bulk.hash.success', 1, 1)
    res.ok(jsonMessage(`${urlMappings.length} links created`))
  }
}

export default BulkController
