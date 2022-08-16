/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableTag } from '../repositories/types'
import { TagType } from '../models/tag'
import { Mapper } from './Mapper'

@injectable()
export class TagMapper implements Mapper<StorableTag, TagType> {
  persistenceToDto(tagType: TagType): StorableTag
  persistenceToDto(tagType: TagType | null): StorableTag | null {
    if (!tagType) {
      return null
    }
    return {
      id: tagType.id,
      tagKey: tagType.tagKey,
      tagString: tagType.tagString,
    }
  }
}

export default TagMapper
