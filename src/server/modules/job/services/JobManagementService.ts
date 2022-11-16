import { inject, injectable } from 'inversify'
import { NotFoundError } from '../../../util/error'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'
import { JobItemStatusEnum } from '../../../repositories/enums'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { JobItemType, JobType } from '../../../models/job'

@injectable()
class JobManagementService implements interfaces.JobManagementService {
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

  findJobById: (id: number) => Promise<JobType | null> = async (id) => {
    const job = await this.jobRepository.findById(id)
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

  updateJobItem: (
    jobItem: JobItemType,
    changes: Partial<JobItemType>,
  ) => Promise<JobItemType> = async (jobItem, changes) => {
    return this.jobItemRepository.update(jobItem, changes)
  }

  findJobItemsByJobId: (jobId: number) => Promise<JobItemType[]> = async (
    jobId,
  ) => {
    const job = await this.jobRepository.findById(jobId)
    if (!job) {
      throw new NotFoundError('Job not found')
    }

    const jobItems = await this.jobItemRepository.findJobItemsByJobId(jobId)

    return jobItems
  }

  // 'success' when all related job items are also successful
  // 'failed' if at least one of them job item failed
  // 'in progress' if at least one of the job item is in progress (while the rest are either in progress or successful)
  getJobStatus: (jobId: number) => Promise<JobItemStatusEnum> = async (
    jobId,
  ) => {
    const jobItems = await this.findJobItemsByJobId(jobId)

    if (jobItems.length === 0) {
      throw new Error('Job does not have any job items')
    }

    let isInProgress = false

    for (let i = 0; i < jobItems.length; i += 1) {
      const { status } = jobItems[i]
      if (status === JobItemStatusEnum.Failed) {
        return JobItemStatusEnum.Failed
      }
      if (status === JobItemStatusEnum.InProgress) {
        isInProgress = true
      }
    }

    if (isInProgress) {
      return JobItemStatusEnum.InProgress
    }
    return JobItemStatusEnum.Success
  }
}

export default JobManagementService
