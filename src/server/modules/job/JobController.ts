import { Request } from 'express'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { DependencyIds } from '../../constants'
import dogstatsd from '../../util/dogstatsd'
import { SQSServiceInterface } from '../../services/sqs'
import { JobManagementService } from './interfaces'

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
    const jobBatchSize = 5 // temp
    const { userId, jobParamsList } = req.body
    const jobBatches = _.chunk(jobParamsList, jobBatchSize)
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
          })
          await this.sqsService.sendMessage(messageParams)
          return
        }),
      )
      dogstatsd.increment('job.start.success', 1, 1)
    } catch (e) {
      dogstatsd.increment('job.start.failure', 1, 1)
    }
  }
}

export default JobController
