import { injectable } from 'inversify'
import { UrlSearchServiceInterface } from '../../../../src/server/services/interfaces/UrlSearchServiceInterface'
import {
  SearchResultsSortOrder,
  StorableUrlState,
} from '../../../../src/server/repositories/enums'
import { UrlsPaginated } from '../../../../src/server/repositories/types'

@injectable()
export class UrlSearchServiceMock implements UrlSearchServiceInterface {
  plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit?: number,
    offset?: number,
  ) => Promise<UrlsPaginated> = () => {
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
          clicks: 10000,
        },
      ],
      count: 0,
    })
  }
}

export default UrlSearchServiceMock
