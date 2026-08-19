/* eslint-disable class-methods-use-this, no-dupe-class-members */
import { injectable } from 'inversify'
import { TagType } from '../models/tag.js'
import { Mapper } from './Mapper.js'

@injectable()
export class TagMapper implements Mapper<string, TagType> {
  persistenceToDto(tagType: TagType): string
  persistenceToDto(tagType: TagType | null): string | null {
    if (!tagType) {
      return null
    }
    return tagType.tagString
  }
}

export default TagMapper
