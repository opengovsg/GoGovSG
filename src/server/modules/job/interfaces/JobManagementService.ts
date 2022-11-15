import { JobItemType, JobType } from '../../../models/job'
import { JobItemStatusEnum } from '../../../repositories/enums'

export interface JobManagementService {
  createJob(userId: number): Promise<JobType>
  findJobById(id: number): Promise<JobType | null>
  createJobItem: (properties: {
    params: JSON
    jobId: number
  }) => Promise<JobItemType>
  updateJobItem(
    jobItem: JobItemType,
    changes: Partial<JobItemType>,
  ): Promise<JobItemType>
  findJobItemsByJobId(jobId: number): Promise<JobItemType[]>
  getJobStatus(jobId: number): Promise<JobItemStatusEnum>
}
