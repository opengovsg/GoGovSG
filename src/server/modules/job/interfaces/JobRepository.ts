import { JobType } from '../../../models/job'

export interface JobRepository {
  findById(id: number): Promise<JobType | null>
  create(userId: number): Promise<JobType>
  update(job: JobType, changes: Partial<JobType>): Promise<JobType>
  findJobForUser(userId: number, jobId: number): Promise<JobType | null>
  findLatestJobForUser(userId: number): Promise<JobType | null>
}
