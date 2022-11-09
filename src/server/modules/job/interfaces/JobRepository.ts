import { JobType } from '../../../models/job'

export interface JobRepository {
  findById(id: number): Promise<JobType | null>
  create(userId: Number): Promise<JobType>
}
