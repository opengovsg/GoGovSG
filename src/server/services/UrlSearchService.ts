import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'
import { UrlsPublicPaginated } from '../repositories/types'
import { SearchResultsSortOrder } from '../../shared/search'

@injectable()
export class UrlSearchService {
  private urlRepository: UrlRepositoryInterface

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
  ) {
    this.urlRepository = urlRepository
  }

  public plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
  ) => Promise<UrlsPublicPaginated> = async (query, order, limit, offset) => {
    const {
      urls: privateUrls,
      count,
    } = await this.urlRepository.plainTextSearch(query, order, limit, offset)
    return {
      // Specific click counts are classified for certain government links
      urls: privateUrls.map(
        ({
          longUrl,
          shortUrl,
          contactEmail,
          description,
          isFile,
          isSearchable,
        }) => ({
          longUrl,
          shortUrl,
          contactEmail,
          description,
          isFile,
          isSearchable,
        }),
      ),
      count,
    }
  }
}

export default UrlSearchService
