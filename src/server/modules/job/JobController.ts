import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { DependencyIds } from '../../constants'
import dogstatsd from '../../util/dogstatsd'
import { SQSServiceInterface } from '../../services/sqs'
import { JobManagementService } from './interfaces'
import { logger, qrCodeJobBatchSize } from '../../config'
import jsonMessage from '../../util/json'

@injectable()
export class JobController {
  private sqsService: SQSServiceInterface

  private jobManagementService: JobManagementService

  public constructor(
    @inject(DependencyIds.jobManagementService)
    jobManagementService: JobManagementService,
    @inject(DependencyIds.sqsService)
    sqsService: SQSServiceInterface,
  ) {
    this.sqsService = sqsService
    this.jobManagementService = jobManagementService
  }

  public createAndStartJob: (req: Request) => Promise<void> = async (req) => {
    const { userId, jobParamsList } = req.body
    if (!jobParamsList || jobParamsList.length === 0) {
      return
    }

    const jobBatches = _.chunk(jobParamsList, qrCodeJobBatchSize)
    try {
      const job = await this.jobManagementService.createJob(userId)

      await Promise.all(
        jobBatches.map(async (jobBatch, idx) => {
          const messageParams = {
            jobItemId: `${job.uuid}/${idx}`,
            mappings: jobBatch,
          }
          await this.jobManagementService.createJobItem({
            params: <JSON>(<unknown>messageParams),
            jobId: job.id,
            jobItemId: `${job.uuid}/${idx}`,
          })
          await this.sqsService.sendMessage(messageParams)
          return
        }),
      )
      dogstatsd.increment('job.start.success', 1, 1)
    } catch (error) {
      logger.error(`error creating and starting job: ${error}`)
      dogstatsd.increment('job.start.failure', 1, 1)
    }
  }

  public updateJobItem: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { jobItemId, status } = req.body
    try {
      const jobItem = await this.jobManagementService.updateJobItemStatus(
        jobItemId,
        status,
      )
      // add jobItem to req.body so that downstream controllers can access it
      req.body.jobItem = jobItem
      res.ok(jsonMessage('successfully updated'))
      dogstatsd.increment('jobItem.update.success', 1, 1)
    } catch (error) {
      dogstatsd.increment('jobItem.update.failure', 1, 1)
      logger.error(`error updating job ${jobItemId}: ${error}`)
      res.status(404).send(jsonMessage(error.message))
    }
    return
  }

  public updateJob: (req: Request) => Promise<void> = async (req) => {
    const {
      jobItem: { jobId },
    } = req.body
    try {
      await this.jobManagementService.updateJobStatus(jobId)
      dogstatsd.increment('job.update.success', 1, 1)
    } catch (error) {
      dogstatsd.increment('job.update.failure', 1, 1)
      logger.error(`error updating job ${jobId}: ${error}`)
    }
    return
  }
}

export default JobController
