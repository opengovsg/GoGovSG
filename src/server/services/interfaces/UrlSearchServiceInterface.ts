import { UrlsPaginated } from '../../repositories/types'

export interface UrlSearchServiceInterface {
  /**
   * Returns urls that match the query based on their shortUrl and
   * description. The results are ranked in order of relevance based
   * on click count, length and cover density.
   * @param  {string} query
   * @param  {number} limit Number of results to return.
   * @param  {number} offset The number of top results to skip.
   * @returns Promise of total no. Of search results and the results on the current page.
   */
  plainTextSearch: (
    query: string,
    limit?: number,
    offset?: number,
  ) => Promise<UrlsPaginated>
}
