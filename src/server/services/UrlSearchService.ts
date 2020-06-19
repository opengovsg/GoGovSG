import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'
import { UrlsPaginated } from '../repositories/types'

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
    limit: number,
    offset: number,
  ) => Promise<UrlsPaginated> = (query, limit, offset) => {
    return this.urlRepository.plainTextSearch(query, limit, offset)
  }
}

export default UrlSearchService
