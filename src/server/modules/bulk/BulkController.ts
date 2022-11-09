import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { UploadedFile } from 'express-fileupload'
import _ from 'lodash'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { BulkService } from './interfaces'
import { UrlManagementService } from '../user/interfaces'
import dogstatsd from '../../util/dogstatsd'
import { SQSServiceInterface } from '../../services/sqs'
import { JobManagementService } from '../job/interfaces'

const QR_CODE_BATCH_SIZE = 5

@injectable()
export class BulkController {
  private urlManagementService: UrlManagementService

  private bulkService: BulkService

  private sqsService: SQSServiceInterface

  private jobManagementService: JobManagementService

  public constructor(
    @inject(DependencyIds.bulkService)
    bulkService: BulkService,
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
    @inject(DependencyIds.jobManagementService)
    jobManagementService: JobManagementService,
    @inject(DependencyIds.sqsService)
    sqsService: SQSServiceInterface,
  ) {
    this.bulkService = bulkService
    this.urlManagementService = urlManagementService
    this.sqsService = sqsService
    this.jobManagementService = jobManagementService
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
      res.badRequest(jsonMessage(schema.errorMessage))
      return
    }
    // put longUrls on the req body so that it can be used by other controllers
    req.body.longUrls = schema.longUrls
    next()
  }

  public bulkCreate: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const { userId, longUrls, tags } = req.body
    // generate url mappings
    const urlMappings = await this.bulkService.generateUrlMappings(longUrls)
    // put urpMappings on the req body so that it can be used by other controllers
    req.body.urlMappings = urlMappings
    // bulk create
    try {
      await this.urlManagementService.bulkCreate(userId, urlMappings, tags)
    } catch (e) {
      dogstatsd.increment('bulk.hash.failure', 1, 1)
      res.badRequest(jsonMessage('Something went wrong, please try again.'))
      return
    }

    dogstatsd.increment('bulk.hash.success', 1, 1)
    // res.ok(jsonMessage(`${urlMappings.length} links created`))
    next()
  }

  public bulkCreateQrCodes: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
      const { userId, urlMappings } = req.body
      const urlMappingBatches = _.chunk(urlMappings, QR_CODE_BATCH_SIZE)

      try {
        const job = await this.jobManagementService.createJob(userId)

        await Promise.all(
          urlMappingBatches.map(async (urlMappingBatch, idx) => {
            const messageParams = {
              filePath: `${job.uuid}/${idx}`,
              mappings: urlMappingBatch,
            }
            await this.jobManagementService.createJobItem({
              params: <JSON>(<unknown>messageParams),
              jobId: job.id,
            })
            await this.sqsService.sendMessage(messageParams)
            return
          }),
        )

        dogstatsd.increment('bulk.qr.success', 1, 1)
        res.ok(
          jsonMessage(`${urlMappings.length} links created, job id ${job.id}`),
        )
      } catch (err) {
        console.log(err)
        dogstatsd.increment('bulk.qr.failure', 1, 1)
        res.badRequest(jsonMessage('Something went wrong, please try again.'))
      }
    }
}

export default BulkController
