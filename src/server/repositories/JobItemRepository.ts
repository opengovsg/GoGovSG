import { inject, injectable } from 'inversify'
import { Mapper } from '../mappers/Mapper'
import { JobItem, JobItemType } from '../models/job'
import { DependencyIds } from '../constants'
import { StorableJobItem } from './types'
import { JobItemRepositoryInterface } from './interfaces/JobItemRepositoryInterface'
import { JobItemStatusEnum } from './enums'
import { NotFoundError } from '../util/error'

@injectable()
export class JobItemRepository implements JobItemRepositoryInterface {
  private jobItemMapper: Mapper<StorableJobItem, JobItemType>

  public constructor(
    @inject(DependencyIds.jobItemMapper)
    jobItemMapper: Mapper<StorableJobItem, JobItemType>,
  ) {
    this.jobItemMapper = jobItemMapper
  }

  findJobItemsByJobId: (jobId: number) => Promise<StorableJobItem[]> = async (
    jobId,
  ) => {
    const jobItems = await JobItem.scope(['defaultScope']).findAll({
      where: { jobId },
    })

    return jobItems.map((jobItem) =>
      this.jobItemMapper.persistenceToDto(jobItem),
    )
  }

  create: (properties: {
    status: JobItemStatusEnum
    message: string
    params: JSON
    jobId: number
  }) => Promise<StorableJobItem> = async (properties) => {
    // jobId is validated through service layer
    const jobItem = await JobItem.create(properties)
    if (!jobItem) throw new Error('Newly-created job item is null')
    return this.jobItemMapper.persistenceToDto(jobItem)
  }

  update: (
    jobItem: StorableJobItem,
    changes: Partial<StorableJobItem>,
  ) => Promise<StorableJobItem> = async (jobItem, changes) => {
    const { id } = jobItem
    const dbJobItem = await JobItem.scope(['defaultScope']).findOne({
      where: { id },
    })
    if (!dbJobItem) {
      throw new NotFoundError(`job item is not found in database`)
    }
    const updatedJobItem = await dbJobItem.update({ ...changes })
    if (!updatedJobItem) throw new Error('Newly-updated job item is null')
    return this.jobItemMapper.persistenceToDto(updatedJobItem)
  }
}

export default JobItemRepository
