import { inject, injectable } from 'inversify'
import { Op, Transaction } from 'sequelize'
import { Tag, TagType } from '../models/tag.js'
import { Url } from '../models/url.js'
import { TagRepositoryInterface } from './interfaces/TagRepositoryInterface.js'
import { UserTagsQueryConditions } from './types.js'
import { Mapper } from '../mappers/Mapper.js'
import { DependencyIds } from '../constants.js'

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
        tagKey: {
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
              // NOTE: We do two operations here (find + create) to get around
              // needing to create a temporary function as per sequelize's implementation
              // of `findOrCreate`.
              // This is acceptable because the max number of tags is small (max of 4),
              // the table itself is not large (38k rows on go)
              // and it's indexed (tagString, tagKey, id)
              const tagWhere = {
                tagString: tag,
                tagKey: tag.toLowerCase(),
              }

              // First, try to find existing tag
              const possibleTag = await Tag.findOne({
                transaction: t,
                where: tagWhere,
              })

              if (possibleTag) return possibleTag

              // If not found, try to create it
              try {
                return await Tag.create(tagWhere, { transaction: t })
              } catch (error: any) {
                // Handle race condition: another transaction created it between our find and create
                if (
                  error instanceof Error &&
                  error.name === 'SequelizeUniqueConstraintError'
                ) {
                  const existingTag = await Tag.findOne({
                    transaction: t,
                    where: tagWhere,
                  })
                  if (existingTag) return existingTag
                }
                throw error
              }
            }),
          )
        : []
      const newTags: TagType[] = []
      tagCreationResponses.forEach((response) => {
        const tag = response
        if (tag) {
          newTags.push(tag)
        }
      })
      return newTags
    }
}

export default TagRepository
