import { Transaction } from 'sequelize'
import { UserTagsQueryConditions } from '../types.js'
import { TagType } from '../../models/tag.js'

export interface TagRepositoryInterface {
  findTagsWithConditions(conditions: UserTagsQueryConditions): Promise<string[]>
  upsertTags(tags: string[], t: Transaction): Promise<TagType[]>
}
