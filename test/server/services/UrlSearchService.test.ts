import { UrlSearchService } from '../../../src/server/services/UrlSearchService'
import { UrlRepositoryMock } from '../mocks/repositories/UrlRepository'
import { SearchResultsSortOrder } from '../../../src/server/repositories/enums'

/**
 * Unit tests for UrlSearchService.
 */
describe('UrlSearchService tests', () => {
  describe('plainTextSearch tests', () => {
    it('Should return results from repository with clicks stripped', async () => {
      const repository = new UrlRepositoryMock()
      const service = new UrlSearchService(repository)
      const args: [string, SearchResultsSortOrder, number, number] = [
        'fakequery',
        SearchResultsSortOrder.Popularity,
        1000,
        0,
      ]
      const spy = jest.spyOn(repository, 'plainTextSearch')
      await expect(service.plainTextSearch(...args)).resolves.toStrictEqual({
        urls: [
          {
            shortUrl: 'test-moh',
            longUrl: 'https://www.moh.gov.sg/covid-19',
            description: '',
            contactEmail: null,
          },
        ],
        count: 0,
      })
      expect(repository.plainTextSearch).toBeCalledWith(...args)
      spy.mockClear()
    })
  })
})
