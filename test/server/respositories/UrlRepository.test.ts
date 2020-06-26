import { QueryTypes } from 'sequelize'
import {
  mockQuery,
  mockTransaction,
  redisMockClient,
  urlModelMock,
} from '../api/util'
import { S3InterfaceMock } from '../mocks/services/aws'
import { UrlRepository } from '../../../src/server/repositories/UrlRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { SearchResultsSortOrder } from '../../../src/server/repositories/enums'

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

jest.mock('../../../src/server/util/sequelize', () => ({
  transaction: mockTransaction,
  sequelize: { query: mockQuery },
}))

const repository = new UrlRepository(new S3InterfaceMock(), new UrlMapper())
const cacheGetSpy = jest.spyOn(redisMockClient, 'get')

describe('UrlRepository tests', () => {
  beforeEach(async () => {
    redisMockClient.flushall()
    cacheGetSpy.mockClear()
  })
  describe('getLongUrl tests', () => {
    it('should return from db when cache is empty', async () => {
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })

    it('should return from cache when cache is filled', async () => {
      redisMockClient.set('a', 'aaa')
      await expect(repository.getLongUrl('a')).resolves.toBe('aaa')
    })

    it('should return from db when cache is down', async () => {
      cacheGetSpy.mockImplementationOnce((_, callback) => {
        if (!callback) {
          return false
        }
        callback(new Error('Cache down'), 'Error')
        return false
      })
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })
  })

  describe('plainTextSearch tests', () => {
    beforeEach(() => {
      mockQuery.mockClear()
    })
    it('should call sequelize.query with correct raw query and params and return the results', async () => {
      await expect(
        repository.plainTextSearch(
          'query',
          SearchResultsSortOrder.Popularity,
          100,
          0,
        ),
      ).resolves.toStrictEqual({
        count: 10,
        urls: [
          {
            shortUrl: 'a',
            longUrl: 'aa',
            state: 'ACTIVE',
            clicks: 0,
            isFile: false,
            createdAt: 'fakedate',
            updatedAt: 'fakedate',
            description: 'desc',
            contactEmail: 'aa@aa.com',
          },
        ],
      })

      expect(mockQuery).toBeCalledWith(
        `
      SELECT count(*)
      FROM urls, plainto_tsquery($query) query
      WHERE query @@ (
      setweight(to_tsvector('english', urls."shortUrl"), 'A') ||
      setweight(to_tsvector('english', urls."description"), 'B')
    )
    `,
        { bind: { query: 'query' }, raw: true, type: QueryTypes.SELECT },
      )

      expect(mockQuery).toBeCalledWith(
        `
      SELECT urls.*
      FROM urls, plainto_tsquery($query) query
      WHERE query @@ (
      setweight(to_tsvector('english', urls."shortUrl"), 'A') ||
      setweight(to_tsvector('english', urls."description"), 'B')
    ) AND state = 'ACTIVE'
      ORDER BY (urls.clicks) desc
      limit $limit
      offset $offset`,
        {
          bind: { limit: 100, offset: 0, query: 'query' },
          mapToModel: true,
          model: expect.any(Object),
          type: QueryTypes.SELECT,
        },
      )
    })

    it('should call sequelize.query with correct ordering when relevance order is input', async () => {
      await repository.plainTextSearch(
        'query',
        SearchResultsSortOrder.Relevance,
        100,
        0,
      )

      expect(mockQuery).toBeCalledWith(
        `
      SELECT urls.*
      FROM urls, plainto_tsquery($query) query
      WHERE query @@ (
      setweight(to_tsvector('english', urls."shortUrl"), 'A') ||
      setweight(to_tsvector('english', urls."description"), 'B')
    ) AND state = 'ACTIVE'
      ORDER BY (ts_rank_cd(
      setweight(to_tsvector('english', urls."shortUrl"), 'A') ||
      setweight(to_tsvector('english', urls."description"), 'B')
    , query, 1) * log(urls.clicks + 1)) desc
      limit $limit
      offset $offset`,
        {
          bind: { limit: 100, offset: 0, query: 'query' },
          mapToModel: true,
          model: expect.any(Object),
          type: QueryTypes.SELECT,
        },
      )
    })

    it('should call sequelize.query with correct ordering when recency order is input', async () => {
      await repository.plainTextSearch(
        'query',
        SearchResultsSortOrder.Recency,
        100,
        0,
      )

      expect(mockQuery).toBeCalledWith(
        `
      SELECT urls.*
      FROM urls, plainto_tsquery($query) query
      WHERE query @@ (
      setweight(to_tsvector('english', urls."shortUrl"), 'A') ||
      setweight(to_tsvector('english', urls."description"), 'B')
    ) AND state = 'ACTIVE'
      ORDER BY (urls."createdAt") desc
      limit $limit
      offset $offset`,
        {
          bind: { limit: 100, offset: 0, query: 'query' },
          mapToModel: true,
          model: expect.any(Object),
          type: QueryTypes.SELECT,
        },
      )
    })

    it('should throw when incorrect sort order is input', async () => {
      await expect(
        repository.plainTextSearch(
          'query',
          'a' as SearchResultsSortOrder,
          100,
          0,
        ),
      ).rejects.toThrowError()
    })
  })
})
