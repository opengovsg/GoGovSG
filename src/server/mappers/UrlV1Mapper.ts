/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableUrl } from '../repositories/types'
import { UrlV1DTO } from '../modules/api/external-v1'
import { Mapper } from './Mapper'

/**
 * UrlV1Mapper maps from the original URL DTO (StorableUrl)
 * to another DTO (UrlV1DTO, used in the API v1 controller).
 * `persistenceToDto` is hence a misnomer for this mapper,
 * and this should be changed in the future.
 */
@injectable()
export class UrlV1Mapper implements Mapper<UrlV1DTO, StorableUrl> {
  persistenceToDto(url: StorableUrl): UrlV1DTO
  persistenceToDto(url: StorableUrl | null): UrlV1DTO | null {
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

export default UrlV1Mapper
