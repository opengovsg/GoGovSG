import { inject, injectable } from 'inversify'
import { Mapper } from '../mappers/Mapper'
import { Job, JobType } from '../models/job'
import { DependencyIds } from '../constants'

import { StorableJob } from './types'
import { JobRepositoryInterface } from './interfaces/JobRepositoryInterface'

@injectable()
export class JobRepository implements JobRepositoryInterface {
  private jobMapper: Mapper<StorableJob, JobType>

  public constructor(
    @inject(DependencyIds.jobMapper)
    jobMapper: Mapper<StorableJob, JobType>,
  ) {
    this.jobMapper = jobMapper
  }

  findById: (id: number) => Promise<StorableJob | null> = async (id) => {
    return this.jobMapper.persistenceToDto(
      await Job.scope(['defaultScope']).findOne({ where: { id } }),
    )
  }

  create: (userId: Number) => Promise<StorableJob> = async (userId) => {
    const job = await Job.scope(['defaultScope']).create({ userId })
    if (!job) throw new Error('Newly-created job is null')
    return this.jobMapper.persistenceToDto(job)
  }
}

export default JobRepository
