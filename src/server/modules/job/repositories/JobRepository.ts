import { injectable } from 'inversify'
import { Job, JobType } from '../../../models/job'
import * as interfaces from '../interfaces'

@injectable()
export class JobRepository implements interfaces.JobRepository {
  findById: (id: number) => Promise<JobType | null> = async (id) => {
    return Job.findByPk(id)
  }

  create: (userId: Number) => Promise<JobType> = async (userId) => {
    const job = await Job.scope(['defaultScope']).create({ userId })
    if (!job) throw new Error('Newly-created job is null')
    return job
  }
}

export default JobRepository
