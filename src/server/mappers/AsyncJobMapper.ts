/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableAsyncJob } from '../repositories/types'
import { AsyncJobType } from '../models/job'
import { Mapper } from './Mapper'

@injectable()
export class AsyncJobMapper implements Mapper<StorableAsyncJob, AsyncJobType> {
  persistenceToDto(asyncJobType: AsyncJobType): StorableAsyncJob
  persistenceToDto(asyncJobType: AsyncJobType | null): StorableAsyncJob | null {
    if (!asyncJobType) {
      return null
    }
    return {
      id: asyncJobType.id,
      status: asyncJobType.status,
      message: asyncJobType.message,
      type: asyncJobType.type,
      params: asyncJobType.params,
      outputs: asyncJobType.outputs,
      userId: asyncJobType.userId,
      completedAt: asyncJobType.completedAt,
    }
  }
}

export default AsyncJobMapper
