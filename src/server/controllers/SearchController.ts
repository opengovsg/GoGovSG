import { inject, injectable } from 'inversify'
import Express from 'express'
import { UrlSearchServiceInterface } from '../services/interfaces/UrlSearchServiceInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import jsonMessage from '../util/json'
import { SearchControllerInterface } from './interfaces/SearchControllerInterface'
import { SearchResultsSortOrder } from '../../shared/search'

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
      limit = 100,
      offset = 0,
    } = req.query as UrlSearchRequest

    try {
      const { urls, count } = await this.urlSearchService.plainTextSearch(
        query,
        order as SearchResultsSortOrder,
        limit,
        offset,
      )

      res.ok({
        urls,
        count,
      })
      return
    } catch (error) {
      logger.error(`Error searching urls: ${error}`)
      res.serverError(jsonMessage('Error retrieving URLs for search'))
    }
  }
}

export default SearchController
