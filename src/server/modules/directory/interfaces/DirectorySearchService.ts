import { UrlDirectoryPaginated } from '../../../repositories/types.js'
import { DirectoryQueryConditions } from '../index.js'

/**
 * Access url repository for search base on query parameters.
 */
export interface DirectorySearchService {
  /**
   * Returns urls that match the query based on their shortUrl and
   * description. The results are ranked in order of either popularity
   * or recency.
   * @param  {DirectoryQueryConditions} conditions Query conditions.
   * @returns Promise of total no. Of search results and the results on the current page.
   */
  plainTextSearch(
    conditions: DirectoryQueryConditions,
  ): Promise<UrlDirectoryPaginated>
}
