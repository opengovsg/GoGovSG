/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableJob } from '../repositories/types'
import { JobType } from '../models/job'
import { Mapper } from './Mapper'

@injectable()
export class JobMapper implements Mapper<StorableJob, JobType> {
  persistenceToDto(jobType: JobType): StorableJob
  persistenceToDto(jobType: JobType | null): StorableJob | null {
    if (!jobType) {
      return null
    }
    return {
      uuid: jobType.uuid,
      id: jobType.id,
    }
  }
}

export default JobMapper
