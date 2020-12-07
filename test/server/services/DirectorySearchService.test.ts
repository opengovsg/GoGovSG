import { DirectorySearchService } from '../../../src/server/services/DirectorySearchService'
import { UrlRepositoryMock } from '../mocks/repositories/UrlRepository'
import { SearchResultsSortOrder } from '../../../src/shared/search'
import { DirectoryQueryConditions } from '../../../src/server/services/interfaces/DirectorySearchServiceInterface'
import { urlSearchVector } from '../../../src/server/models/search'
/**
 * Unit tests for DirectorySearchService.
 */

jest.mock('../../../src/server/models/url', () => ({
  Url: { tableName: 'Url' },
}))

jest.mock('../../../src/server/util/parse', () => ({
  sanitiseQuery: (query: string) => query,
  extractShortUrl: (query: string) => query,
}))

const repository = new UrlRepositoryMock()
const service = new DirectorySearchService(repository)

describe('DirectorySearchService tests', () => {
  describe('plainTextSearch tests', () => {
    it('Should return results from repository for keyword text search', async () => {
      const conditions: DirectoryQueryConditions = {
        query: 'test-moh',
        order: SearchResultsSortOrder.Recency,
        limit: 10,
        offset: 0,
        state: 'ACTIVE',
        isFile: false,
        isEmail: false,
      }
      const spy = jest.spyOn(repository, 'getRelevantUrlsFromText')
      await expect(service.plainTextSearch(conditions)).resolves.toStrictEqual({
        urls: [
          {
            shortUrl: 'test-moh',
            state: 'ACTIVE',
            isFile: false,
            email: 'test@test.gov.sg',
          },
        ],
        count: 0,
      })
      expect(repository.getRelevantUrlsFromText).toBeCalledWith(
        urlSearchVector,
        // eslint-disable-next-line
        "Url.\"createdAt\"",
        10,
        0,
        // eslint-disable-next-line
        "test-moh",
        `AND urls.state = 'ACTIVE'`,
        `AND urls."isFile"=false`,
      )
      spy.mockClear()
    })
    it('Should return results from repository for email search', async () => {
      const conditions: DirectoryQueryConditions = {
        query: '@test.gov.sg',
        order: SearchResultsSortOrder.Recency,
        limit: 10,
        offset: 0,
        state: 'ACTIVE',
        isFile: false,
        isEmail: true,
      }
      const spy = jest.spyOn(repository, 'getRelevantUrlsFromEmail')
      await expect(service.plainTextSearch(conditions)).resolves.toStrictEqual({
        urls: [
          {
            shortUrl: 'test-moh',
            state: 'ACTIVE',
            isFile: false,
            email: 'test@test.gov.sg',
          },
        ],
        count: 0,
      })
      expect(repository.getRelevantUrlsFromEmail).toBeCalledWith(
        ['@test.gov.sg'],
        // eslint-disable-next-line
        "Url.\"createdAt\"",
        10,
        0,
        ['ACTIVE'],
        [false],
      )
      spy.mockClear()
    })
  })
})
