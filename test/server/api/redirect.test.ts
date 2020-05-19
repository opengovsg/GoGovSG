/* eslint-disable no-undef, no-underscore-dangle, import/no-extraneous-dependencies */
import httpMocks from 'node-mocks-http'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { UrlCache } from '../../../src/server/api/cache/url'
import { UrlRepository } from '../../../src/server/api/repositories/url'
import { AnalyticsLogger } from '../../../src/server/api/analytics/analyticsLogger'
import AnalyticsLoggerMock from './mocks/analytics'
import {
  UrlCacheMockDown,
  UrlCacheMockEmpty,
  UrlCacheMockFilled,
} from './mocks/cache/url'
import {
  UrlRepositoryMockDown,
  UrlRepositoryMockEmpty,
  UrlRepositoryMockFilled,
} from './mocks/repositories/url'
import {
  createRequestWithShortUrl,
  getUrlCache,
  getUrlRepository,
  isAnalyticsLogged,
} from './util'
import redirect from '../../../src/server/api/redirect'
import { CookieReducer } from '../../../src/server/util/transitionPage'
import {
  CookieArrayReducerMockVisited,
  CookieArrayReducerMockUnvisited,
} from './mocks/transitionPage'
import { logger } from '../config'

const loggerErrorSpy = jest.spyOn(logger, 'error')

describe('redirect API tests', () => {
  beforeEach(() => {
    container
      .bind<CookieReducer>(DependencyIds.cookieReducer)
      .to(CookieArrayReducerMockVisited)
  })

  afterEach(() => {
    container.unbindAll()
    loggerErrorSpy.mockClear()
  })

  test('url exists in cache and db, real user visited', async () => {
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aaa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
  })

  test('url exists in cache and db, real user unvisited', async () => {
    const cookieReducer = new CookieArrayReducerMockUnvisited()
    container.unbind(DependencyIds.cookieReducer)
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    container
      .bind<CookieReducer>(DependencyIds.cookieReducer)
      .toConstantValue(cookieReducer)
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'

    const cookieSpy = jest.spyOn(cookieReducer, 'writeShortlinkToCookie')

    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    expect(res.statusCode).toBe(200)
    expect(res._getRedirectUrl()).toBe('')
    expect(cookieReducer.writeShortlinkToCookie).toHaveBeenCalledWith(
      undefined,
      'aaa',
    )

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
    cookieSpy.mockClear()
  })

  test('url exists in cache and db, real user visited', async () => {
    const cookieReducer = new CookieArrayReducerMockVisited()
    container.unbind(DependencyIds.cookieReducer)
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    container
      .bind<CookieReducer>(DependencyIds.cookieReducer)
      .toConstantValue(cookieReducer)
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'

    const cookieSpy = jest.spyOn(cookieReducer, 'writeShortlinkToCookie')

    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aaa')
    expect(cookieReducer.writeShortlinkToCookie).toHaveBeenCalledWith(
      undefined,
      'aaa',
    )

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
    cookieSpy.mockClear()
  })

  test('url exists in cache and db crawler', async () => {
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aaa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
  })

  test('url does not exist in cache but does in db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockEmpty)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    const cache = getUrlCache() as UrlCacheMockEmpty
    expect(cache.cache.get('aaa')).toBe('longUrlFromDb')
    expect(cache.cache.size).toBe(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('longUrlFromDb')

    expect(isAnalyticsLogged(req, res, 'aaa', 'longUrlFromDb')).toBeTruthy()
  })

  test('url does not exist in neither cache nor db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockEmpty)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockEmpty)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)

    const cache = getUrlCache() as UrlCacheMockEmpty
    expect(cache.cache.size).toBe(0)
    expect(res.statusCode).toBe(404)
    expect(res._getRedirectUrl()).toBe('')
  })

  test('url does exists in cache but not db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockEmpty)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)

    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aaa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
  })

  test('url does exists in db but cache is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockDown)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)

    const repo = getUrlRepository() as UrlRepositoryMockFilled
    expect(repo.clicks.get('aaa')).toBe(1)
    expect(repo.clicks.size).toBe(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('longUrlFromDb')

    expect(isAnalyticsLogged(req, res, 'aaa', 'longUrlFromDb')).toBeTruthy()
  })

  test('both db and cache down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockDown)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockDown)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(404)
    expect(res._getRedirectUrl()).toBe('')
    expect(logger.error).toBeCalled()
  })

  test('url in cache and db is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockDown)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aaa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aaa')).toBeTruthy()
  })

  test('url not in db and cache is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockDown)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockEmpty)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(404)
  })

  test('url not in cache and db is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockEmpty)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockDown)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(404)
    expect(logger.error).toBeCalled()
  })

  test('invalid url', async () => {
    const req = createRequestWithShortUrl(')*')
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(404)
  })

  test('no url', async () => {
    const req = createRequestWithShortUrl(undefined)
    const res = httpMocks.createResponse()
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheMockFilled)
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositoryMockFilled)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    await redirect(req, res)
    expect(res.statusCode).toBe(404)
  })
})
