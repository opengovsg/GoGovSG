import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { UploadedFile } from 'express-fileupload'
import { JobItemStatusEnum } from '../../repositories/enums'
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

  public bulkCreate: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { userId, longUrls, tags } = req.body
    // generate url mappings
    const urlMappings = await this.bulkService.generateUrlMappings(longUrls)
    // bulk create
    try {
      await this.urlManagementService.bulkCreate(userId, urlMappings, tags)
    } catch (e) {
      dogstatsd.increment('bulk.hash.failure', 1, 1)
      res.badRequest(jsonMessage('Something went wrong, please try again.'))
      return
    }

    dogstatsd.increment('bulk.hash.success', 1, 1)

    console.log('creating job')

    const job = await this.jobManagementService.createJob(userId)

    console.log('job created')

    for (let i = 0; i < urlMappings.length; i += QR_CODE_BATCH_SIZE) {
      const urlMapping = urlMappings.slice(i, i + QR_CODE_BATCH_SIZE)
      const sqsBody = { filePath: `${job.uuid}/${1}`, mappings: urlMapping }
      // eslint-disable-next-line no-await-in-loop
      await this.jobManagementService.createJobItem({
        status: JobItemStatusEnum.InProgress,
        message: '',
        params: <JSON>(<unknown>sqsBody),
        jobId: job.id,
      })

      // validate jobItem -> what happens if jobItem wasn't created?

      // eslint-disable-next-line no-await-in-loop
      await this.sqsService.sendMessage(sqsBody.filePath, sqsBody.mappings)
    }

    res.ok(jsonMessage(`${urlMappings.length} links created`))
  }
}

export default BulkController
