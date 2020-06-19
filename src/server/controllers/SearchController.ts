import { inject, injectable } from 'inversify'
import Express from 'express'
import { UrlSearchServiceInterface } from '../services/interfaces/UrlSearchServiceInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import jsonMessage from '../util/json'
import { SearchControllerInterface } from './interfaces/SearchControllerInterface'

type UrlSearchRequest = {
  query: string
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
    const { query, limit = 10000, offset = 0 } = req.query as UrlSearchRequest

    try {
      const { urls, count } = await this.urlSearchService.plainTextSearch(
        query,
        limit,
        offset,
      )

      res.ok({
        urls,
        count,
      })
    } catch (error) {
      logger.error(`Error searching urls: ${error}`)
      res.serverError(jsonMessage('Error retrieving URLs for user'))
    }
  }
}

export default SearchController
