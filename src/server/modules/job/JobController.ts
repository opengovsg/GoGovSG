import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { DependencyIds } from '../../constants'
import dogstatsd from '../../util/dogstatsd'
import { SQSServiceInterface } from '../../services/sqs'
import { JobManagementService } from './interfaces'
import { logger, qrCodeJobBatchSize } from '../../config'
import jsonMessage from '../../util/json'
import { NotFoundError } from '../../util/error'

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

  public createAndStartJob: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
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
        res.ok({ count: jobParamsList.length, job })
      } catch (error) {
        logger.error(`error creating and starting job: ${error}`)
        dogstatsd.increment('job.start.failure', 1, 1)
        // created links but failed to create and start job
        res.status(400).send({ count: jobParamsList.length })
      }
      return
    }

  public updateJobItem: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const { jobItemId, status } = req.body
    try {
      const jobItem = await this.jobManagementService.updateJobItemStatus(
        jobItemId,
        status,
      )
      // add jobItem to req.body so that downstream controllers can access it
      req.body.jobItem = jobItem
      dogstatsd.increment('jobItem.update.success', 1, 1)
      res.ok(jsonMessage('successfully updated'))
    } catch (error) {
      dogstatsd.increment('jobItem.update.failure', 1, 1)
      logger.error(`error updating job ${jobItemId}: ${error}`)
      res.status(404).send(jsonMessage(error.message))
      return
    }
    next()
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

  public getLatestJob: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const { userId } = req.body
    try {
      const jobInformation =
        await this.jobManagementService.getLatestJobForUser(userId)
      res.ok(jobInformation)
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.ok(jsonMessage('User has no jobs'))
        return
      }
      res.badRequest(jsonMessage('Please try again'))
    }
    return
  }

  public pollJobStatusUpdate: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
      const { userId, jobId } = req.body
      try {
        const jobInformation =
          await this.jobManagementService.pollJobStatusUpdate(userId, jobId)
        res.ok(jobInformation)
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.notFound(jsonMessage(error.message))
          return
        }
        res.status(408).send(jsonMessage('Request timed out, please try again'))
      }
      return
    }
}

export default JobController
