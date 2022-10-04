import { JobStatusEnum, JobTypeEnum } from '../enums'
import { StorableJobItem } from '../types'

export interface JobItemRepositoryInterface {
  findJobItemsByJobId(jobId: number): Promise<StorableJobItem[]>
  create(properties: {
    status: JobStatusEnum
    message: string
    type: JobTypeEnum
    params: JSON
    jobId: number
  }): Promise<StorableJobItem>
  update(
    jobItem: StorableJobItem,
    changes: Partial<StorableJobItem>,
  ): Promise<StorableJobItem>
}
