import { StorableFile, StorableUrl, UrlDirectoryPaginated } from '../types'

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
   * Search results base on email domains.
   * @param {string[]} likeQuery List of valid email and domains for SQL query.
   * @param {string} rankingAlgorithm Sort order.
   * @param {number} limit Number of results returned.
   * @param {number} offset Number of results skipped.
   * @param {string[]} queryState List of states to retrieve for SQL query.
   * @param {boolean[]} queryFile List of url types to retrieve for SQL query.
   * @returns Promise that returns list of longUrl and count.
   */
  getRelevantUrlsFromEmail: (
    likeQuery: string[],
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    queryState: string[],
    queryFile: boolean[],
  ) => Promise<UrlDirectoryPaginated>

  /**
   * Search results base on keywords.
   * @param {string} urlVector Vectorised search expression.
   * @param {string} rankingAlgorithm Sort order.
   * @param {number} limit Number of results returned.
   * @param {number} offset Number of results skipped.
   * @param {string} query Search query to be vectorised.
   * @param {string} queryState States to retrieve for SQL query.
   * @param {string} queryFile Url types to retrieve for SQL query.
   * @returns Promise that returns list of longUrl and count.
   */
  getRelevantUrlsFromText: (
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
    queryState: string,
    queryFile: string,
  ) => Promise<UrlDirectoryPaginated>
}
