/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableUrl } from '../repositories/types'
import { UrlV2DTO } from '../modules/api/external-v2'
import { Mapper } from './Mapper'

/**
 * UrlV2Mapper maps from the original URL DTO (StorableUrl)
 * to another DTO (UrlV2DTO, used in the API v2 controller).
 * `persistenceToDto` is hence a misnomer for this mapper,
 * and this should be changed in the future.
 */
@injectable()
export class UrlV2Mapper implements Mapper<UrlV2DTO, StorableUrl> {
  persistenceToDto(url: StorableUrl): UrlV2DTO
  persistenceToDto(url: StorableUrl | null): UrlV2DTO | null {
    if (!url) {
      return null
    }
    return {
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      state: url.state,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }
  }
}

export default UrlV2Mapper
