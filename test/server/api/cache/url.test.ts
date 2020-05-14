import 'reflect-metadata'
import { spy } from 'sinon'
import { NotFoundError } from '../../../../src/server/util/error'
import { logger, redirectExpiry } from '../../config'
import { redisMockClient } from '../util'
import { UrlCacheRedis } from '../../../../src/server/api/cache/url'

jest.mock('../../../../src/server/config', () => ({
  redirectExpiry,
  logger,
}))
jest.mock('../../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

const setSpy = spy(redisMockClient, 'set')
const cache = new UrlCacheRedis()

describe('url cache redis test', () => {
  beforeEach(async () => {
    await new Promise((resolve) => {
      redisMockClient.flushall(() => resolve())
    })
  })

  test('cache new short url and retrieve long url', async () => {
    await cache.cacheShortUrl('Aaa', 'Aaaa')
    expect(await cache.getLongUrlFromCache('Aaa')).toBe('Aaaa')
    expect(setSpy.lastCall.args.slice(-3).slice(0, 2)).toStrictEqual([
      'EX',
      redirectExpiry,
    ])
  })
  test('cache existing short url and retrieve new longUrl', async () => {
    await cache.cacheShortUrl('Aaa', 'Aaaa')
    await cache.cacheShortUrl('Aaa', 'Aaaab')
    expect(await cache.getLongUrlFromCache('Aaa')).toBe('Aaaab')
    expect(setSpy.lastCall.args.slice(-3).slice(0, 2)).toStrictEqual([
      'EX',
      redirectExpiry,
    ])
  })

  test('retrieve non existent mapping and throw NotFoundError', async () => {
    await expect(cache.getLongUrlFromCache('Aaa')).rejects.toThrow(
      NotFoundError,
    )
  })

  test('rethrow unhandled errors', async () => {
    const originalGet = redisMockClient.get
    redisMockClient.get = () => {
      throw Error()
    }
    await expect(cache.getLongUrlFromCache('Aaa')).rejects.toThrow(Error)

    redisMockClient.get = originalGet
  })
})
