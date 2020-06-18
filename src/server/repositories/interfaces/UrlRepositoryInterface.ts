import { StorableFile, StorableUrl } from '../types'

/**
 * A url repository that handles access to the data store of Urls.
 */
export interface UrlRepositoryInterface {
  findByShortUrl(shortUrl: string): Promise<StorableUrl | null>

  /**
   * Updates the input url with the input changes and file (if any) in the data store.
   * @param  {StorableUrl} url The url to modify.
   * @param  {object} changes The key value pairs contained in this object will overwrite those in the original url.
   * @param  {StorableFile} file? The file to change to (if any).
   * @returns Promise.
   */
  update(
    url: StorableUrl,
    changes: object,
    file?: StorableFile,
  ): Promise<StorableUrl>

  /**
   * Create a new Url in the data store.
   * @param  {{userId:number;shortUrl:string;longUrl?:string}} properties Properties of new Url.
   * @param  {StorableFile} file? File that this Url leads to, if any.
   * @returns Promise that resolves to the newly created url.
   */
  create(
    properties: { userId: number; shortUrl: string; longUrl?: string },
    file?: StorableFile,
  ): Promise<StorableUrl>

  /**
   * Looks up the longUrl given a shortUrl from the cache, falling back
   * to the database. The cache is re-populated if the database lookup is
   * performed successfully.
   * @param {string} shortUrl The shortUrl.
   * @returns Promise that resolves to the longUrl.
   * @throws {NotFoundError}
   */
  getLongUrl: (shortUrl: string) => Promise<string>

  /**
   * Asynchronously increment the number of clicks in the database.
   * @param {string} shortUrl
   * @returns Promise that resolves to be empty.
   */
  incrementClick: (shortUrl: string) => Promise<void>

  /**
   * Asynchronously upserts the relevant short link's statistics.
   *
   * @param shortUrl The relevant short url.
   * @returns Promise that resolves to be empty.
   */
  updateClickStatistics: (shortUrl: string) => Promise<void>

  /**
   * Asynchronously updates the relevant short link's week map statistics.
   *
   * @param shortUrl The relevant short url.
   * @returns Promise that resolves to be empty.
   */
  updateDayStatistics: (shortUrl: string) => Promise<void>

  /**
   * Asynchronously updates the relevant short link's device statistics.
   *
   * @param shortUrl The relevant short url.
   * @param userAgent The relevant user agent string to parse device type.
   * @returns Promise that resolves to be empty.
   */
  updateDeviceStatistics: (shortUrl: string, userAgent: string) => Promise<void>

  /**
   * Asynchronously upserts the relevant short link's statistics.
   *
   * @param shortUrl The relevant short url.
   * @returns Promise that resolves to be empty.
   */
  updateLinkStatistics: (shortUrl: string, userAgent: string) => Promise<void>
}
