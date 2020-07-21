import { injectable } from 'inversify'
import { UrlSearchServiceInterface } from '../../../../src/server/services/interfaces/UrlSearchServiceInterface'
import { StorableUrlState } from '../../../../src/server/repositories/enums'
import { UrlsPublicPaginated } from '../../../../src/server/repositories/types'
import { SearchResultsSortOrder } from '../../../../src/shared/search'

@injectable()
export class UrlSearchServiceMock implements UrlSearchServiceInterface {
  plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit?: number,
    offset?: number,
  ) => Promise<UrlsPublicPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          shortUrl: 'test-moh',
          longUrl: 'https://www.moh.gov.sg/covid-19',
          state: StorableUrlState.Active,
          isFile: false,
          createdAt: '2020-04-17T09:10:07.491Z',
          updatedAt: '2020-06-09T10:07:07.557Z',
          description: '',
          contactEmail: null,
        },
      ],
      count: 0,
    })
  }
}

export default UrlSearchServiceMock
