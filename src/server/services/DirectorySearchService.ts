import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'
import { UrlDirectoryPaginated } from '../repositories/types'
import { DirectoryQueryConditions } from './interfaces/DirectorySearchServiceInterface'

@injectable()
export class DirectorySearchService {
  private urlRepository: UrlRepositoryInterface

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
  ) {
    this.urlRepository = urlRepository
  }

  public plainTextSearch: (
    conditions: DirectoryQueryConditions,
  ) => Promise<UrlDirectoryPaginated> = async (conditions) => {
    // find urls from text search and email search
    const results = await this.urlRepository.rawDirectorySearch(
      conditions.query,
      conditions.order,
      conditions.limit,
      conditions.offset,
      conditions.state,
      conditions.isFile,
      conditions.isEmail,
    )

    const output = {
      urls: results,
      count: results.length,
    }
    return output as UrlDirectoryPaginated
  }
}

export default DirectorySearchService
