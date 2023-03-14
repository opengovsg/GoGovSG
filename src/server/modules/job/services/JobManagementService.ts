import { inject, injectable } from 'inversify'
import { NotFoundError } from '../../../util/error'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'
import { Mailer } from '../../../services/email'
import { JobItemStatusEnum, JobStatusEnum } from '../../../../shared/util/jobs'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { JobItemType, JobType } from '../../../models/job'
import { jobPollAttempts, jobPollInterval, logger } from '../../../config'

@injectable()
export class JobManagementService implements interfaces.JobManagementService {
  private jobRepository: interfaces.JobRepository

  private jobItemRepository: interfaces.JobItemRepository

  private userRepository: UserRepositoryInterface

  private mailer: Mailer

  private qrCodeBucketUrl: string

  constructor(
    @inject(DependencyIds.jobRepository)
    jobRepository: interfaces.JobRepository,
    @inject(DependencyIds.jobItemRepository)
    jobItemRepository: interfaces.JobItemRepository,
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.mailer)
    mailer: Mailer,
    @inject(DependencyIds.qrCodeBucketUrl)
    qrCodeBucketUrl: string,
  ) {
    this.jobRepository = jobRepository
    this.jobItemRepository = jobItemRepository
    this.userRepository = userRepository
    this.mailer = mailer
    this.qrCodeBucketUrl = qrCodeBucketUrl
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
      status: isSuccess ? JobItemStatusEnum.Success : JobItemStatusEnum.Failure,
      message: errorMessage || '',
    } as Partial<JobItemType>

    return this.jobItemRepository.update(currJobItem, changes)
  }

  // 'Failure' if any job item fails
  // 'Success' if all job items succeed
  // 'InProgress' if no failure and any job item is still in progress
  computeJobStatus: (jobItems: JobItemType[]) => JobStatusEnum = (jobItems) => {
    if (
      jobItems.some((jobItem) => jobItem.status === JobItemStatusEnum.Failure)
    ) {
      return JobStatusEnum.Failure
    }
    if (
      jobItems.some(
        (jobItem) => jobItem.status === JobItemStatusEnum.InProgress,
      )
    ) {
      return JobStatusEnum.InProgress
    }
    return JobStatusEnum.Success
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
        jobItemUrls: jobItems.map(
          (jobItem) => `${this.qrCodeBucketUrl}/${jobItem.jobItemId}`,
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
      const { job, jobItemUrls } = await this.getJobInformation(jobId)
      // if job status has changed, return updated job status
      if (job.status !== JobStatusEnum.InProgress) {
        return resolve({ job, jobItemUrls })
      }
      // continue polling
      setTimeout(executePoll, jobPollInterval, resolve, reject)

      attempts += 1
    }
    return new Promise(executePoll)
  }

  sendJobCompletionEmail: (jobId: number) => Promise<void> = async (jobId) => {
    const { job, jobItemUrls } = await this.getJobInformation(jobId)

    const user = await this.userRepository.findById(job.userId)
    if (!user) {
      throw new NotFoundError(`user not found for jobId ${jobId}`)
    }

    try {
      if (job.status === JobStatusEnum.Success) {
        await this.mailer.mailJobSuccess(user.email, jobItemUrls)
      }
      if (job.status === JobStatusEnum.Failure) {
        await this.mailer.mailJobFailure(user.email)
      }
    } catch (error) {
      logger.error(
        `Error mailing job id ${jobId} completion email to ${user.email}: ${error}`,
      )
      throw new Error('Error mailing job completion email.')
    }
  }
}

export default JobManagementService
