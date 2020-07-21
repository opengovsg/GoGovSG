import { UrlsPublicPaginated } from '../../repositories/types'
import { SearchResultsSortOrder } from '../../../shared/search'

export interface UrlSearchServiceInterface {
  /**
   * Returns urls that match the query based on their shortUrl and
   * description. The results are ranked in order of relevance based
   * on click count, length and cover density.
   * @param  {string} query
   * @param  {number} limit Number of results to return.
   * @param  {number} offset The number of top results to skip.
   * @param  {SearchResultsSortOrder} order The sorting rule for search results.
   * @returns Promise of total no. Of search results and the results on the current page.
   */
  plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit?: number,
    offset?: number,
  ) => Promise<UrlsPublicPaginated>
}
