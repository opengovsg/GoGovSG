import { JobItemType, JobType } from '../../../models/job'
import { JobItemStatusEnum } from '../../../repositories/enums'

export interface JobItemCallbackStatus {
  isSuccess: boolean
  errorMessage?: string
}

export interface JobManagementService {
  createJob(userId: number): Promise<JobType>
  createJobItem: (properties: {
    params: JSON
    jobId: number
    jobItemId: string
  }) => Promise<JobItemType>
  updateJobItem(
    jobItemId: string,
    status: JobItemCallbackStatus,
  ): Promise<JobItemType>
  getJobStatus(jobId: number): Promise<JobItemStatusEnum>
}
