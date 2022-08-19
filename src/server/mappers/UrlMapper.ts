/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableUrl } from '../repositories/types'
import { UrlType } from '../models/url'
import { Mapper } from './Mapper'
// import {TagType} from "../models/tag";

@injectable()
export class UrlMapper implements Mapper<StorableUrl, UrlType> {
  persistenceToDto(urlType: UrlType): StorableUrl
  persistenceToDto(urlType: UrlType | null): StorableUrl | null {
    if (!urlType) {
      return null
    }
    const { UrlClicks: urlClicks } = urlType
    if (!urlClicks || !Number.isInteger(urlClicks.clicks))
      throw new Error('UrlClicks object not populated.')

    const tagString: string[] = []
    const { tags } = urlType
    if (tags) {
      for (let i = 0; i < tags.length; i += 1) {
        tagString.push(tags[i].tagString)
      }
    }

    return {
      shortUrl: urlType.shortUrl,
      longUrl: urlType.longUrl,
      state: urlType.state,
      clicks: urlClicks.clicks,
      tags: tagString,
      isFile: urlType.isFile,
      createdAt: urlType.createdAt,
      updatedAt: urlType.updatedAt,
      description: urlType.description,
      contactEmail: urlType.contactEmail,
    }
  }
}

export default UrlMapper
