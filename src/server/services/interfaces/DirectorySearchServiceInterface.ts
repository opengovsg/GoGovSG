import { UrlDirectoryPaginated } from '../../repositories/types'
import { SearchResultsSortOrder } from '../../../shared/search'

/**
 * A type that represents query parameters required for search.
 */
export type DirectoryQueryConditions = {
  query: string
  order: SearchResultsSortOrder
  limit: number
  offset: number
  state: string | undefined
  isFile: boolean | undefined
  isEmail: boolean
}

/**
 * Access url repository for search base on query parameters.
 */
export interface DirectorySearchServiceInterface {
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
