import { UrlType } from '../models/url'

/**
 * A type that represents Urls stored in the data store.
 */
export type StorableUrl = Pick<
  UrlType,
  | 'shortUrl'
  | 'longUrl'
  | 'state'
  | 'clicks'
  | 'isFile'
  | 'createdAt'
  | 'updatedAt'
>

/**
 * A type that represents a file that can be stored in the data store.
 */
export type StorableFile = {
  data: Buffer
  mimetype: string
  key: string
}

export type StorableUser = {
  email: string
  urls?: Array<StorableUrl>
  id: number
}

export type UserUrlsQueryConditions = {
  limit: number
  offset: number
  orderBy: string
  sortDirection: string
  searchText: string
  userId: number
  state: string | undefined
  isFile: boolean | undefined
}

export type UrlsPaginated = {
  count: number
  urls: Array<StorableUrl>
}

export type StorableOtp = {
  hashedOtp: string
  retries: number
}
