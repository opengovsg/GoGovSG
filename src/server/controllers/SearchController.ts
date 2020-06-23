import { inject, injectable } from 'inversify'
import Express from 'express'
import { UrlSearchServiceInterface } from '../services/interfaces/UrlSearchServiceInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import jsonMessage from '../util/json'
import { SearchControllerInterface } from './interfaces/SearchControllerInterface'
import { SearchResultsSortOrder } from '../repositories/enums'

type UrlSearchRequest = {
  query: string
  order: string
  limit?: number
  offset?: number
}

@injectable()
export class SearchController implements SearchControllerInterface {
  private urlSearchService: UrlSearchServiceInterface

  public constructor(
    @inject(DependencyIds.urlSearchService)
    urlSearchService: UrlSearchServiceInterface,
  ) {
    this.urlSearchService = urlSearchService
  }

  public urlSearchPlainText: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const {
      query,
      order,
      limit = 10000,
      offset = 0,
    } = req.query as UrlSearchRequest
    let searchOrder
    try {
      searchOrder =
        SearchResultsSortOrder[order as keyof typeof SearchResultsSortOrder]
    } catch {
      logger.warn(jsonMessage(`Invalid search request order type: ${order}`))
    }

    if (!searchOrder) {
      res.badRequest(jsonMessage('Invalid search order type'))
      return
    }

    try {
      const { urls, count } = await this.urlSearchService.plainTextSearch(
        query,
        searchOrder,
        limit,
        offset,
      )

      // Specific click counts are classified for certain government links
      const processedUrls = urls.map(({ clicks, ...url }) => url)

      res.ok({
        processedUrls,
        count,
      })
    } catch (error) {
      logger.error(`Error searching urls: ${error}`)
      res.serverError(jsonMessage('Error retrieving URLs for search'))
    }
  }
}

export default SearchController
