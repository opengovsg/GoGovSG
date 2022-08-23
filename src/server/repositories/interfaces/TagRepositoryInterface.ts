import { UserTagsQueryConditions } from '../types'

export interface TagRepositoryInterface {
  findTagsWithConditions(conditions: UserTagsQueryConditions): Promise<string[]>
}
