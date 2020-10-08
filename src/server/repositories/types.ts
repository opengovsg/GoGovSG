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
  | 'isSearchable'
  | 'description'
  | 'contactEmail'
  | 'userId'
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

export type UrlPublic = Pick<
  StorableUrl,
  'shortUrl' | 'longUrl' | 'description' | 'contactEmail' | 'isFile'
>

// to be possibly changed
export type UrlDirectory = {
  shortUrl: string
  userId: string | undefined | number
  state: string
}

export type UrlDirectoryPaginated = {
  count: number
  urls: Array<UrlDirectory>
}

export type UrlsPublicPaginated = {
  count: number
  urls: Array<UrlPublic>
}

export type UrlsPaginated = {
  count: number
  urls: Array<StorableUrl>
}

export type StorableOtp = {
  hashedOtp: string
  retries: number
}

export type GlobalStatistics = {
  userCount: number
  clickCount: number
  linkCount: number
}

/**
 * Has a cache duration expressed as a human-readable
 * time interval. An example of this is the threat matches
 * returned by Google Safe Browsing, which have a cacheDuration
 * specified as the number of seconds followed by 's'.
 */
export type HasCacheDuration = {
  cacheDuration: string
}
