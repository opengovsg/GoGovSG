import { inject, injectable } from 'inversify'
import { Op, Transaction } from 'sequelize'
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
    return tags.map((tagType) => {
      return this.tagMapper.persistenceToDto(tagType)
    })
  }

  public upsertTags: (tags: string[], t: Transaction) => Promise<TagType[]> =
    async (tags, t) => {
      const tagCreationResponses = tags
        ? await Promise.all(
            tags.map(async (tag: string) => {
              return Tag.findOrCreate({
                where: {
                  tagString: tag,
                  tagKey: tag.toLowerCase(),
                },
                transaction: t,
              })
            }),
          )
        : []
      const newTags: TagType[] = []
      tagCreationResponses.forEach((response) => {
        const [tag, _] = response
        if (tag) {
          newTags.push(tag)
        }
      })
      return newTags
    }
}

export default TagRepository
