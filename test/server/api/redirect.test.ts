/* eslint-disable no-undef, no-underscore-dangle, import/no-extraneous-dependencies */
import 'reflect-metadata'
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
} from './mocks/cache'
import {
  UrlRepositoryMockDown,
  UrlRepositoryMockEmpty,
  UrlRepositoryMockFilled,
} from './mocks/repository'
import {
  createRequestWithShortUrl,
  getUrlCache,
  getUrlRepository,
  isAnalyticsLogged,
} from './util'
import { logger } from '../config'
import redirect from '../../../src/server/api/redirect'

jest.mock('../../../src/server/config', () => ({
  logger,
}))

describe('redirect API tests', () => {
  afterEach(() => {
    container.unbindAll()
  })

  test('url exists in cache and db', async () => {
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
