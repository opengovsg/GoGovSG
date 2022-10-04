import { StorableAsyncJob } from '../types'
import { JobStatus, JobType } from '../enums'

export interface AsyncJobRepositoryInterface {
  findById(id: string): Promise<StorableAsyncJob | null>
  create(properties: {
    status: JobStatus
    message?: string
    type: JobType
    params: JSON
    userId: Number
  }): Promise<StorableAsyncJob>
  update(
    asyncJob: StorableAsyncJob,
    changes: Partial<StorableAsyncJob>,
  ): Promise<StorableAsyncJob>
}
