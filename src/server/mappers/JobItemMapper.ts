/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableJobItem } from '../repositories/types'
import { JobItemType } from '../models/job'
import { Mapper } from './Mapper'

@injectable()
export class JobItemMapper implements Mapper<StorableJobItem, JobItemType> {
  persistenceToDto(jobItemType: JobItemType): StorableJobItem
  persistenceToDto(jobItemType: JobItemType | null): StorableJobItem | null {
    if (!jobItemType) {
      return null
    }
    return {
      id: jobItemType.id,
      status: jobItemType.status,
      message: jobItemType.message,
      type: jobItemType.type,
      jobId: jobItemType.jobId,
      params: jobItemType.params,
    }
  }
}

export default JobItemMapper
