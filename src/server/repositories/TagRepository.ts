import { inject, injectable } from 'inversify'
import { Op } from 'sequelize'
import { Tag, TagType } from '../models/tag'
import { Url } from '../models/url'
import { TagRepositoryInterface } from './interfaces/TagRepositoryInterface'
import { UserTagsQueryConditions } from './types'
import { Mapper } from '../mappers/Mapper'
import { DependencyIds } from '../constants'

@injectable()
export class TagRepository implements TagRepositoryInterface {
  private tagMapper: Mapper<string, TagType>

  public constructor(
    @inject(DependencyIds.tagMapper) tagMapper: Mapper<string, TagType>,
  ) {
    this.tagMapper = tagMapper
  }

  public findTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]> = async (conditions) => {
    const tags = await Tag.scope(['defaultScope']).findAll({
      where: {
        tagString: {
          [Op.like]: `${conditions.searchText}%`,
        },
      },
      limit: conditions.limit,
      include: [
        {
          model: Url,
          where: { userId: conditions.userId },
        },
      ],
    })
    const tagStrings = tags.map((tagType) => {
      return this.tagMapper.persistenceToDto(tagType)
    })
    return tagStrings
  }
}

export default TagRepository
