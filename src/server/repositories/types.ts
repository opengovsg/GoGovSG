import { UrlType } from '../models/url'

/**
 * A type that represents Urls stored in the data store.
 */
export type StorableUrl = Pick<
  UrlType,
  'shortUrl' | 'longUrl' | 'state' | 'clicks' | 'isFile'
>

/**
 * A type that represents a file that can be stored in the data store.
 */
export type StorableFile = {
  data: Buffer
  mimetype: string
  key: string
}
