import { JobItemStatusEnum } from '../enums'
import { StorableJobItem } from '../types'

export interface JobItemRepositoryInterface {
  findJobItemsByJobId(jobId: number): Promise<StorableJobItem[]>
  create(properties: {
    status: JobItemStatusEnum
    message: string
    params: JSON
    jobId: number
  }): Promise<StorableJobItem>
  update(
    jobItem: StorableJobItem,
    changes: Partial<StorableJobItem>,
  ): Promise<StorableJobItem>
}
