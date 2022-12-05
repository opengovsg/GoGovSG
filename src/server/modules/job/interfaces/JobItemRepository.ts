import { JobItemType } from '../../../models/job'
import { JobItemStatusEnum } from '../../../../shared/util/jobs'

export interface JobItemRepository {
  findByJobItemId(jobItemId: string): Promise<JobItemType | null>
  findJobItemsByJobId(jobId: number): Promise<JobItemType[]>
  create(properties: {
    status: JobItemStatusEnum
    message?: string
    params: JSON
    jobId: number
    jobItemId: string
  }): Promise<JobItemType>
  update(
    jobItem: JobItemType,
    changes: Partial<JobItemType>,
  ): Promise<JobItemType>
}
