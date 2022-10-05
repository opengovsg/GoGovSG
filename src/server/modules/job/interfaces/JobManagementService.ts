import { JobStatusEnum, JobTypeEnum } from '../../../repositories/enums'
import { StorableJob, StorableJobItem } from '../../../repositories/types'

interface JobManagementServiceInterface {
  createJob(userId: number): Promise<StorableJob>
  findJobById(id: number): Promise<StorableJob | null>
  createJobItem: (properties: {
    status: JobStatusEnum
    message: string
    type: JobTypeEnum
    params: JSON
    jobId: number
  }) => Promise<StorableJobItem>
  updateJobItem(
    jobItem: StorableJobItem,
    changes: Partial<StorableJobItem>,
  ): Promise<StorableJobItem>
  findJobItemsByJobId(jobId: number): Promise<StorableJobItem[]>
  isJobSuccess(jobId: number): Promise<boolean>
}
export default JobManagementServiceInterface
