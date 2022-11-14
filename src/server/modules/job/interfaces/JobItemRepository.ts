import { JobItemType } from '../../../models/job'
import { JobItemStatusEnum } from '../../../repositories/enums'

export interface JobItemRepository {
  findById(id: number): Promise<JobItemType | null>
  findJobItemsByJobId(jobId: number): Promise<JobItemType[]>
  create(properties: {
    status: JobItemStatusEnum
    message?: string
    params: JSON
    jobId: number
  }): Promise<JobItemType>
  update(
    jobItem: JobItemType,
    changes: Partial<JobItemType>,
  ): Promise<JobItemType>
}
