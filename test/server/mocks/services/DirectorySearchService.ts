import { injectable } from 'inversify'
import {
  DirectoryQueryConditions,
  DirectorySearchServiceInterface,
} from '../../../../src/server/services/interfaces/DirectorySearchServiceInterface'
import { UrlDirectoryPaginated } from '../../../../src/server/repositories/types'

@injectable()
export class DirectorySearchServiceMock
  implements DirectorySearchServiceInterface {
  plainTextSearch: (
    conditions: DirectoryQueryConditions,
  ) => Promise<UrlDirectoryPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          longUrl: 'https://test-moh.com',
          shortUrl: 'test-moh',
          state: 'ACTIVE',
          isFile: false,
          email: 'test@test.gov.sg',
        },
      ],
      count: 0,
    })
  }
}

export default DirectorySearchServiceMock
