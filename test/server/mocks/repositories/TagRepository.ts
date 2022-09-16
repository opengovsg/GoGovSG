import { Transaction } from 'sequelize'
import { TagType } from '../../../../src/server/models/tag'
import { TagRepositoryInterface } from '../../../../src/server/repositories/interfaces/TagRepositoryInterface'
import { UserTagsQueryConditions } from '../../../../src/server/repositories/types'

class TagRepositoryMock implements TagRepositoryInterface {
  public findTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]> = jest.fn()

  public upsertTags: (tags: string[], t: Transaction) => Promise<TagType[]> =
    jest.fn()
}

export default TagRepositoryMock
