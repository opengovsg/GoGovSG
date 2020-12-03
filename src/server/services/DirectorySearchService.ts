import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'
import { UrlDirectoryPaginated } from '../repositories/types'
import { DirectoryQueryConditions } from './interfaces/DirectorySearchServiceInterface'
import { sanitiseQuery } from '../util/sanitise'
import { Url } from '../models/url'
import { SearchResultsSortOrder } from '../../shared/search'
import { searchDescriptionWeight, searchShortUrlWeight } from '../config'
import { urlSearchVector } from '../models/search'

@injectable()
export class DirectorySearchService {
  private urlRepository: UrlRepositoryInterface

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
  ) {
    this.urlRepository = urlRepository
  }

  private getQueryFileEmail: (isFile: boolean | undefined) => Array<boolean> = (
    isFile,
  ) => {
    let queryFile = [true, false]
    if (isFile === true) queryFile = [true]
    else if (isFile === false) queryFile = [false]

    return queryFile
  }

  private getQueryStateEmail: (state: string | undefined) => Array<string> = (
    state,
  ) => {
    let queryState = ['ACTIVE', 'INACTIVE']
    if (state === 'ACTIVE') queryState = ['ACTIVE']
    else if (state === 'INACTIVE') queryState = ['INACTIVE']

    return queryState
  }

  private getQueryFileText: (isFile: boolean | undefined) => string = (
    isFile,
  ) => {
    let queryFile = ''
    if (isFile === true) queryFile = `AND urls."isFile"=true`
    else if (isFile === false) queryFile = `AND urls."isFile"=false`

    return queryFile
  }

  private getQueryStateText: (state: string | undefined) => string = (
    state,
  ) => {
    let queryState = ''
    if (state === 'ACTIVE') queryState = `AND urls.state = 'ACTIVE'`
    else if (state === 'INACTIVE') queryState = `AND urls.state = 'INACTIVE'`

    return queryState
  }

  /**
   * Generates the ranking algorithm to be used in the ORDER BY clause in the
   * SQL statement based on the input sort order.
   * @param  {SearchResultsSortOrder} order
   * @param  {string} tableName
   * @returns The clause as a string.
   */
  private getRankingAlgorithm: (
    order: SearchResultsSortOrder,
    tableName: string,
  ) => string = (order, tableName) => {
    let rankingAlgorithm
    switch (order) {
      case SearchResultsSortOrder.Relevance:
        {
          // The 3rd argument passed into ts_rank_cd represents
          // the normalization option that specifies whether and how
          // a document's length should impact its rank. It works as a bit mask.
          // 1 divides the rank by 1 + the logarithm of the document length
          const textRanking = `ts_rank_cd('{0, 0, ${searchDescriptionWeight}, ${searchShortUrlWeight}}',${urlSearchVector}, query, 1)`
          rankingAlgorithm = `${textRanking} * log(${tableName}.clicks + 1)`
        }
        break
      case SearchResultsSortOrder.Recency:
        rankingAlgorithm = `${tableName}."createdAt"`
        break
      case SearchResultsSortOrder.Popularity:
        rankingAlgorithm = `${tableName}.clicks`
        break
      default:
        throw new Error(`Unsupported SearchResultsSortOrder: ${order}`)
    }
    return rankingAlgorithm
  }

  public plainTextSearch: (
    conditions: DirectoryQueryConditions,
  ) => Promise<UrlDirectoryPaginated> = async (conditions) => {
    const { tableName } = Url
    const { isEmail, query, isFile, state, order, limit, offset } = conditions
    const rankingAlgorithm = this.getRankingAlgorithm(order, tableName)
    if (isEmail) {
      const emails = query.toString().split(' ')
      const likeQuery = emails.map(sanitiseQuery)
      const queryFile = this.getQueryFileEmail(isFile)
      const queryState = this.getQueryStateEmail(state)
      const results = await this.urlRepository.getRelevantUrlsFromEmail(
        likeQuery,
        rankingAlgorithm,
        limit,
        offset,
        queryState,
        queryFile,
      )
      return results as UrlDirectoryPaginated
    }
    const urlVector = urlSearchVector
    const queryFile = this.getQueryFileText(isFile)
    const queryState = this.getQueryStateText(state)
    const results = await this.urlRepository.getRelevantUrlsFromText(
      urlVector,
      rankingAlgorithm,
      limit,
      offset,
      query,
      queryState,
      queryFile,
    )
    return results as UrlDirectoryPaginated
  }
}

export default DirectorySearchService
