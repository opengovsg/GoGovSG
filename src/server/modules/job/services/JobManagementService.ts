import { inject, injectable } from 'inversify'
import { NotFoundError } from '../../../util/error'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'
import { JobItemStatusEnum, JobStatusEnum } from '../../../repositories/enums'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { JobItemType, JobType } from '../../../models/job'
import {
  jobPollAttempts,
  jobPollInterval,
  qrCodeBucketUrl,
} from '../../../config'

@injectable()
export class JobManagementService implements interfaces.JobManagementService {
  private jobRepository: interfaces.JobRepository

  private jobItemRepository: interfaces.JobItemRepository

  private userRepository: UserRepositoryInterface

  constructor(
    @inject(DependencyIds.jobRepository)
    jobRepository: interfaces.JobRepository,
    @inject(DependencyIds.jobItemRepository)
    jobItemRepository: interfaces.JobItemRepository,
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
  ) {
    this.jobRepository = jobRepository
    this.jobItemRepository = jobItemRepository
    this.userRepository = userRepository
  }

  createJob: (userId: number) => Promise<JobType> = async (userId) => {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const job = await this.jobRepository.create(userId)
    return job
  }

  createJobItem: (properties: {
    params: JSON
    jobId: number
    jobItemId: string
  }) => Promise<JobItemType> = async ({ params, jobId, jobItemId }) => {
    const job = await this.jobRepository.findById(jobId)
    if (!job) {
      throw new NotFoundError('Job not found')
    }

    return this.jobItemRepository.create({
      status: JobItemStatusEnum.InProgress,
      message: '',
      params,
      jobId,
      jobItemId,
    })
  }

  updateJobItemStatus: (
    jobItemId: string,
    status: interfaces.JobItemCallbackStatus,
  ) => Promise<JobItemType> = async (jobItemId, status) => {
    const currJobItem = await this.jobItemRepository.findByJobItemId(jobItemId)
    if (!currJobItem) {
      throw new NotFoundError('Job item not found')
    }
    const { isSuccess, errorMessage } = status
    const changes = {
      status: isSuccess ? JobItemStatusEnum.Success : JobItemStatusEnum.Failed,
      message: errorMessage || '',
    } as Partial<JobItemType>

    return this.jobItemRepository.update(currJobItem, changes)
  }

  // 'Failed' if any job item fail
  // 'Success' if all job items succeed
  // 'InProgress' if no failure and any job item is still in progress
  computeJobStatus: (jobItems: JobItemType[]) => JobStatusEnum = (jobItems) => {
    let jobStatus = JobStatusEnum.Success
    for (let i = 0; i < jobItems.length; i += 1) {
      const { status } = jobItems[i]
      if (status === JobItemStatusEnum.Failed) {
        jobStatus = JobStatusEnum.Failed
        break
      } else if (status === JobItemStatusEnum.InProgress) {
        jobStatus = JobStatusEnum.InProgress
      }
    }
    return jobStatus
  }

  updateJobStatus: (jobId: number) => Promise<JobType> = async (jobId) => {
    const job = await this.jobRepository.findById(jobId)
    if (!job) {
      throw new NotFoundError('Job not found')
    }

    const jobItems = await this.jobItemRepository.findJobItemsByJobId(jobId)
    if (jobItems.length === 0) {
      throw new Error('Job does not have any job items')
    }

    const currJobStatus = this.computeJobStatus(jobItems)
    return this.jobRepository.update(job, { status: currJobStatus })
  }

  getJobInformation: (jobId: number) => Promise<interfaces.JobInformation> =
    async (jobId) => {
      const job = await this.jobRepository.findById(jobId)
      if (!job) {
        throw new NotFoundError('Job not found')
      }

      const jobItems = await this.jobItemRepository.findJobItemsByJobId(jobId)
      if (jobItems.length === 0) {
        throw new Error('Job does not have any job items')
      }

      return {
        job,
        jobItemIds: jobItems.map(
          (jobItem) => `${qrCodeBucketUrl}/${jobItem.jobItemId}`,
        ),
      }
    }

  getLatestJobForUser: (userId: number) => Promise<interfaces.JobInformation> =
    async (userId) => {
      const job = await this.jobRepository.findLatestJobForUser(userId)
      if (!job) {
        throw new NotFoundError('No jobs found')
      }
      const jobInformation = await this.getJobInformation(job.id)
      return jobInformation
    }

  pollJobStatusUpdate: (
    userId: number,
    jobId: number,
  ) => Promise<interfaces.JobInformation> = async (userId, jobId) => {
    const job = await this.jobRepository.findJobForUser(userId, jobId)
    if (!job) {
      throw new NotFoundError('Job not found')
    }

    let attempts = 0
    // eslint-disable-next-line consistent-return
    const executePoll = async (resolve: any, reject: any) => {
      if (attempts === jobPollAttempts) {
        return reject(new Error('Exceeded max attempts'))
      }
      const { job, jobItemIds } = await this.getJobInformation(jobId)
      // if job status has changed, return updated job status
      if (job.status !== JobStatusEnum.InProgress) {
        return resolve({ job, jobItemIds })
      }
      // continue polling
      setTimeout(executePoll, jobPollInterval, resolve, reject)

      attempts += 1
    }
    return new Promise(executePoll)
  }
}

export default JobManagementService
