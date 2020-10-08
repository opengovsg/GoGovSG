/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableUrl } from '../repositories/types'
import { UrlType } from '../models/url'
import { Mapper } from './Mapper'

@injectable()
export class UrlMapper implements Mapper<StorableUrl, UrlType> {
  persistenceToDto(urlType: UrlType): StorableUrl
  persistenceToDto(urlType: UrlType | null): StorableUrl | null {
    if (!urlType) {
      return null
    }
    return {
      shortUrl: urlType.shortUrl,
      longUrl: urlType.longUrl,
      state: urlType.state,
      clicks: urlType.clicks,
      isFile: urlType.isFile,
      createdAt: urlType.createdAt,
      updatedAt: urlType.updatedAt,
      isSearchable: urlType.isSearchable,
      description: urlType.description,
      contactEmail: urlType.contactEmail,
      userId: urlType.userId,
    }
  }
}

export default UrlMapper
