import { injectable } from 'inversify'
import { JobItem, JobItemType } from '../../../models/job'
import * as interfaces from '../interfaces'
import { JobItemStatusEnum } from '../../../repositories/enums'
import { NotFoundError } from '../../../util/error'

@injectable()
export class JobItemRepository implements interfaces.JobItemRepository {
  findByJobItemId: (jobItemId: string) => Promise<JobItemType | null> = async (
    jobItemId,
  ) => {
    const jobItem = await JobItem.scope(['defaultScope']).findOne({
      where: { jobItemId },
    })
    return jobItem
  }

  findJobItemsByJobId: (jobId: number) => Promise<JobItemType[]> = async (
    jobId,
  ) => {
    const jobItems = await JobItem.scope(['defaultScope']).findAll({
      where: { jobId },
    })

    return jobItems
  }

  create: (properties: {
    status: JobItemStatusEnum
    message?: string
    params: JSON
    jobId: number
    jobItemId: string
  }) => Promise<JobItemType> = async (properties) => {
    // jobId is validated through service layer
    const jobItem = await JobItem.create(properties)
    if (!jobItem) throw new Error('Newly-created job item is null')
    return jobItem
  }

  update: (
    jobItem: JobItemType,
    changes: Partial<JobItemType>,
  ) => Promise<JobItemType> = async (jobItem, changes) => {
    const { id } = jobItem
    const dbJobItem = await JobItem.scope(['defaultScope']).findOne({
      where: { id },
    })
    if (!dbJobItem) {
      throw new NotFoundError(`job item is not found in database`)
    }
    const updatedJobItem = await dbJobItem.update({ ...changes })
    if (!updatedJobItem) throw new Error('Newly-updated job item is null')
    return updatedJobItem
  }
}

export default JobItemRepository
