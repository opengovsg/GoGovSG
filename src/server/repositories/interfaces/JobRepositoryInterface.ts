import { StorableJob } from '../types'

export interface JobRepositoryInterface {
  findById(id: number): Promise<StorableJob | null>
  create(userId: Number): Promise<StorableJob>
}
