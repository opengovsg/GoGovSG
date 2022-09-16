/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { TagType } from '../models/tag'
import { Mapper } from './Mapper'

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
