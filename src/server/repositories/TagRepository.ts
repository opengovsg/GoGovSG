import { injectable } from 'inversify'
import { Tag } from '../models/tag'
import { TagRepositoryInterface } from './interfaces/TagRepositoryInterface'
import { UserTagsQueryConditions } from './types'
import { Url } from '../models/url'

@injectable()
export class TagRepository implements TagRepositoryInterface {
  public findTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]> = async (conditions) => {
    const tags = await Tag.scope(['defaultScope']).findAll({
      where: {
        tagString: {
          like: conditions.searchText,
        },
      },
      include: [
        {
          model: Url,
          through: { where: { userId: conditions.userId } },
        },
      ],
    })
    console.log(tags)
    return Promise.resolve([])
  }
}

export default TagRepository
