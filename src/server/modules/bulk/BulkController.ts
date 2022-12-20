import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { UploadedFile } from 'express-fileupload'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { BulkService } from './interfaces'
import { UrlManagementService } from '../user/interfaces'
import dogstatsd, {
  BULK_CREATE_FAILURE,
  BULK_CREATE_SUCCESS,
} from '../../util/dogstatsd'
import { logger, shouldGenerateQRCodes } from '../../config'
import { MessageType } from '../../../shared/util/messages'

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

    try {
      const longUrls = await this.bulkService.parseCsv(file)
      req.body.longUrls = longUrls
      next()
    } catch (error) {
      res.badRequest(jsonMessage(error.message, MessageType.FileUploadError))
      return
    }
  }

  public bulkCreate: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const { userId, longUrls, tags } = req.body
    // generate url mappings
    const urlMappings = await this.bulkService.generateUrlMappings(longUrls)

    // bulk create
    try {
      await this.urlManagementService.bulkCreate(userId, urlMappings, tags)
    } catch (e) {
      dogstatsd.increment(BULK_CREATE_FAILURE, 1, 1)
      res.badRequest(jsonMessage('Something went wrong, please try again.'))
      return
    }
    dogstatsd.increment(BULK_CREATE_SUCCESS, 1, 1)
    if (shouldGenerateQRCodes) {
      logger.info('shouldGenerateQRCodes true, triggering QR code generation')
      // put jobParamsList on the req body so that it can be used by JobController
      req.body.jobParamsList = urlMappings
      next()
    } else {
      logger.info(
        'shouldGenerateQRCodes false, not triggering QR code generation',
      )
      res.ok({ count: urlMappings.length })
    }
  }
}

export default BulkController
