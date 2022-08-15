import { inject, injectable } from 'inversify'
import { Mapper } from '../mappers/Mapper'
import { TagType } from '../models/tag'
import { DependencyIds } from '../constants'
import { TagRepositoryInterface } from './interfaces/TagRepositoryInterface'
import { StorableTag } from './types'

@injectable()
export class TagRepository implements TagRepositoryInterface {
  private tagMapper: Mapper<StorableTag, TagType>

  public constructor(
    @inject(DependencyIds.tagMapper) tagMapper: Mapper<StorableTag, TagType>,
  ) {
    this.tagMapper = tagMapper
  }
}

export default TagRepository
