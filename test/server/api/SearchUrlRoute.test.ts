import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { UrlSearchServiceMock } from '../mocks/services/UrlSearchService'
import { UrlSearchServiceInterface } from '../../../src/server/services/interfaces/UrlSearchServiceInterface'
import { DependencyIds } from '../../../src/server/constants'

// Binds mockups before binding default
container
  .bind<UrlSearchServiceInterface>(DependencyIds.userRepository)
  .to(UrlSearchServiceMock)

// Importing setup app
import app from './setup'

describe('GET: /api/search', () => {
  test('positive test: Should get search results from utils', async (done) => {
    const limit = 10
    const offset = 0
    const query = 'moh'
    const order = 'relevance'
    const queryString = `/api/search/urls?query=${query}&order=${order}&limit=${limit}&offset=${offset}`
    const res = await request(app).get(queryString)
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    // From test/server/api/utils
    expect(res.text).toBe(
      '{"urls":[{"longUrl":"aa","shortUrl":"a","contactEmail":"aa@aa.com","description":"desc","isFile":false,"isSearchable":true}],"count":10}',
    )
    done()
  })
})
