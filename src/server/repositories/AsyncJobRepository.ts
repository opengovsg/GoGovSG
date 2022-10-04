import { inject, injectable } from 'inversify'
import { Mapper } from '../mappers/Mapper'
import { AsyncJob, AsyncJobType } from '../models/job'
import { AsyncJobRepositoryInterface } from './interfaces/AsyncJobRepositoryInterface'
import { StorableAsyncJob } from './types'
import { DependencyIds } from '../constants'
import { JobStatus, JobType } from './enums'
import { sequelize } from '../util/sequelize'
import { NotFoundError } from '../util/error'

/**
 * A asyncJob repository that handles access to the data store of AsyncJob.
 * The following implementation uses Sequelize.
 */
@injectable()
export class AsyncJobRepository implements AsyncJobRepositoryInterface {
  private asyncJobMapper: Mapper<StorableAsyncJob, AsyncJobType>

  public constructor(
    @inject(DependencyIds.asyncJobMapper)
    asyncJobMapper: Mapper<StorableAsyncJob, AsyncJobType>,
  ) {
    this.asyncJobMapper = asyncJobMapper
  }

  findById: (id: string) => Promise<StorableAsyncJob | null> = async (id) => {
    return this.asyncJobMapper.persistenceToDto(await AsyncJob.findByPk(id))
  }

  create: (properties: {
    status: JobStatus
    message?: string
    type: JobType
    params: JSON
    userId: Number
  }) => Promise<StorableAsyncJob> = async (properties) => {
    const newAsyncJob = await sequelize.transaction(async (t) => {
      const asyncJob = await AsyncJob.create(properties, { transaction: t })
      return asyncJob
    })

    if (!newAsyncJob) throw new Error('Newly-created asyncJob is null')
    return this.asyncJobMapper.persistenceToDto(newAsyncJob)
  }

  update: (
    asyncJob: StorableAsyncJob,
    changes: Partial<StorableAsyncJob>,
  ) => Promise<StorableAsyncJob> = async (asyncJob, changes) => {
    const { id } = asyncJob
    const currAsyncJob = await AsyncJob.findByPk(id)
    if (currAsyncJob === null) {
      throw new NotFoundError(`asyncJob not found in database}`)
    }

    const updatedAsyncJob = await currAsyncJob.update({ ...changes })

    if (!updatedAsyncJob) throw new Error('Newly-updated asyncJob is null')
    return this.asyncJobMapper.persistenceToDto(updatedAsyncJob)
  }
}
export default AsyncJobRepository
