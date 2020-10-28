import {
  StorableFile,
  StorableUrl,
  UrlDirectoryPaginated,
  UrlsPaginated,
} from '../types'
import { SearchResultsSortOrder } from '../../../shared/search'

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
   * Performs plain text search on Urls based on their shortUrl and
   * description. The results are ranked in order of relevance based
   * on click count, length and cover density.
   * @param  {string} query The search query in plain text.
   * @param  {number} limit Number of results to return.
   * @param  {number} offset The number of top results to skip.
   * @param  {SearchResultsSortOrder} order The sorting rule for search results.
   * @returns Promise of total no. Of search results and the results on the current page.
   */
  plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
  ) => Promise<UrlsPaginated>

  /**
   * Performs search for email and plain text search.
   * @param  {string} query The search query in plain text.
   * @param  {SearchResultsSortOrder} order The sorting rule for search results.
   * @param  {number} limit The number of results to return.
   * @param  {number} offset The number of results to skip.
   * @param  {string | undefined} state The state of the shorturl.
   * @param  {boolean | undefined} isFile Determines if the shorturl is a file or a link.
   * @param  {boolean} isEmail Determines the search on email or plain text search.
   * @returns Promise of total no. Of search results and the results on the current page.
   */
  rawDirectorySearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
    state: string | undefined,
    isFile: boolean | undefined,
    isEmail: boolean,
  ) => Promise<UrlDirectoryPaginated>
}
