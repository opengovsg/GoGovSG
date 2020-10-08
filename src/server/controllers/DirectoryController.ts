import { inject, injectable } from 'inversify'
import Express from 'express'
import { DirectorySearchServiceInterface } from '../services/interfaces/DirectorySearchServiceInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import jsonMessage from '../util/json'
import { DirectoryControllerInterface } from './interfaces/DirectoryControllerInterface'
import { SearchResultsSortOrder } from '../../shared/search'

@injectable()
export class DirectoryController implements DirectoryControllerInterface {
  private directorySearchService: DirectorySearchServiceInterface

  public constructor(
    @inject(DependencyIds.directorySearchService)
    directorySearchService: DirectorySearchServiceInterface,
  ) {
    this.directorySearchService = directorySearchService
  }

  public getDirectoryWithConditions: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    let { limit = 100, query = '', order = '' } = req.query
    limit = Math.min(100, Number(limit))
    query = query.toString().toLowerCase()
    order = order.toString()
    const { offset = 0, isFile, state, isEmail } = req.query

    const queryConditions = {
      query,
      order: order as SearchResultsSortOrder,
      limit,
      offset: Number(offset),
      state: state?.toString(),
      isFile: undefined as boolean | undefined,
      isEmail: undefined as boolean | undefined,
    }

    // Reassign isFile and isEmail to booleans
    if (isFile === 'true') {
      queryConditions.isFile = true
    } else if (isFile === 'false') {
      queryConditions.isFile = false
    }
    if (isEmail === 'true') {
      queryConditions.isEmail = true
    } else if (isEmail === 'false') {
      queryConditions.isEmail = false
    }
    try {
      const { urls, count } = await this.directorySearchService.plainTextSearch(
        queryConditions,
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

export default DirectoryController
