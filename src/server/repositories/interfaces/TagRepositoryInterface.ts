import { Transaction } from 'sequelize'
import { UserTagsQueryConditions } from '../types'
import { TagType } from '../../models/tag'

export interface TagRepositoryInterface {
  findTagsWithConditions(conditions: UserTagsQueryConditions): Promise<string[]>
  upsertTags(tags: string[], t: Transaction): Promise<TagType[]>
}
