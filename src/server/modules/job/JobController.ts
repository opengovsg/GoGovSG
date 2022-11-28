import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { DependencyIds } from '../../constants'
import dogstatsd, {
  JOB_EMAIL_FAILURE,
  JOB_EMAIL_SUCCESS,
  JOB_ITEM_UPDATE_FAILURE,
  JOB_ITEM_UPDATE_SUCCESS,
  JOB_START_FAILURE,
  JOB_START_SUCCESS,
  JOB_UPDATE_FAILURE,
  JOB_UPDATE_SUCCESS,
} from '../../util/dogstatsd'
import { SQSServiceInterface } from '../../services/sqs'
import { JobManagementService } from './interfaces'
import { JobStatusEnum } from '../../repositories/enums'
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
        dogstatsd.increment(JOB_START_SUCCESS, 1, 1)
        res.ok({ count: jobParamsList.length, job })
      } catch (error) {
        logger.error(`error creating and starting job: ${error}`)
        dogstatsd.increment(JOB_START_FAILURE, 1, 1)
        // created links but failed to create and start job
        res.serverError({ count: jobParamsList.length })
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
      // add jobId to req.body so that downstream controllers can access it
      req.body.jobId = jobItem.jobId
      dogstatsd.increment(JOB_ITEM_UPDATE_SUCCESS, 1, 1)
      res.ok(jsonMessage('successfully updated'))
    } catch (error) {
      dogstatsd.increment(JOB_ITEM_UPDATE_FAILURE, 1, 1)
      logger.error(`error updating job item ${jobItemId}: ${error}`)
      res.status(404).send(jsonMessage(error.message))
      return
    }
    next()
  }

  public updateJob: (req: Request) => Promise<void> = async (req) => {
    const { jobId } = req.body
    try {
      const job = await this.jobManagementService.updateJobStatus(jobId)
      dogstatsd.increment(JOB_UPDATE_SUCCESS, 1, 1)
      if (job.status === JobStatusEnum.InProgress) return
    } catch (error) {
      dogstatsd.increment(JOB_UPDATE_FAILURE, 1, 1)
      logger.error(`error updating job ${jobId}: ${error}`)
      return
    }

    try {
      await this.jobManagementService.sendJobCompletionEmail(jobId)
      dogstatsd.increment(JOB_EMAIL_SUCCESS, 1, 1)
    } catch (error) {
      dogstatsd.increment(JOB_EMAIL_FAILURE, 1, 1)
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
      res.serverError(jsonMessage(error.message))
    }
    return
  }

  public pollJobStatusUpdate: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
      const { jobId } = req.query
      const user = req.session?.user
      if (!user) {
        res.status(401).send(jsonMessage('User session does not exist'))
        return
      }
      try {
        const jobInformation =
          await this.jobManagementService.pollJobStatusUpdate(
            user.id,
            parseInt(jobId as string, 10),
          )
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
