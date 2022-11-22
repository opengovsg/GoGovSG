import { injectable } from 'inversify'
import { Job, JobType } from '../../../models/job'
import * as interfaces from '../interfaces'
import { NotFoundError } from '../../../util/error'

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

  update: (job: JobType, changes: Partial<JobType>) => Promise<JobType> =
    async (job, changes) => {
      const { id } = job
      const dbJob = await Job.scope(['defaultScope']).findOne({
        where: { id },
      })
      if (!dbJob) {
        throw new NotFoundError(`job is not found in database`)
      }
      const updatedJob = await dbJob.update({ ...changes })
      if (!updatedJob) throw new Error('Newly-updated job is null')
      return updatedJob
    }

  findLatestJobForUser: (userId: number) => Promise<JobType | null> = async (
    userId,
  ) => {
    return Job.findOne({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    })
  }

  findJobForUser: (userId: number, jobId: number) => Promise<JobType | null> =
    async (userId, jobId) => {
      return Job.findOne({
        where: {
          userId,
          id: jobId,
        },
      })
    }
}

export default JobRepository
