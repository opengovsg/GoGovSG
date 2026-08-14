import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface.js'
import { DependencyIds } from '../../../constants.js'
import { UrlDirectoryPaginated } from '../../../repositories/types.js'
import * as interfaces from '../interfaces/index.js'
import { DirectoryQueryConditions } from '../index.js'

@injectable()
export class DirectorySearchService
  implements interfaces.DirectorySearchService
{
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
    const results = await this.urlRepository.rawDirectorySearch(conditions)

    return results as UrlDirectoryPaginated
  }
}

export default DirectorySearchService
