/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http'
import {
  clicksModelMock,
  createRequestWithShortUrl,
  devicesModelMock,
  heatMapModelMock,
  isAnalyticsLogged,
  mockTransaction,
  redisMockClient,
  sequelizeMock,
  urlModelMock,
} from '../api/util'
import { S3InterfaceMock } from '../mocks/services/aws'
import { UrlRepository } from '../../../src/server/repositories/UrlRepository'
import { UrlRepositoryInterface } from '../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { AnalyticsLogger } from '../../../src/server/services/analyticsLogger'
import AnalyticsLoggerMock from '../mocks/services/analytics'

import { CookieArrayReducerServiceInterface } from '../../../src/server/services/interfaces/CookieArrayReducerServiceInterface'
import {
  CookieArrayReducerMockUnvisited,
  CookieArrayReducerMockVisited,
} from '../mocks/services/transition-page'
import { RedirectService } from '../../../src/server/services/RedirectService'
import { RedirectServiceInterface } from '../../../src/server/services/interfaces/RedirectServiceInterface'
import { RedirectController } from '../../../src/server/controllers/RedirectController'
import { logger } from '../config'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { CrawlerCheckServiceInterface } from '../../../src/server/services/interfaces/CrawlerCheckServiceInterface'
import { CrawlerCheckService } from '../../../src/server/services/CrawlerCheckService'
import { LinkStatisticsServiceInterface } from '../../../src/server/services/interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsServiceMock } from '../mocks/services/LinkStatisticsService'

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

jest.mock('../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

jest.mock('../../../src/server/util/sequelize', () => ({
  sequelize: sequelizeMock,
  transaction: mockTransaction,
}))

const loggerErrorSpy = jest.spyOn(logger, 'error')
const repository = new UrlRepository(new S3InterfaceMock(), new UrlMapper())
const linkStatisticsServiceMock = new LinkStatisticsServiceMock()
const updateStatisticsSpy = jest.spyOn(
  linkStatisticsServiceMock,
  'updateLinkStatistics',
)
const dbFindOneSpy = jest.spyOn(urlModelMock, 'findOne')
const cacheGetSpy = jest.spyOn(redisMockClient, 'get')

function mockCacheDown() {
  cacheGetSpy.mockImplementationOnce((_, callback) => {
    if (!callback) {
      return false
    }
    callback(new Error('Cache down'), 'Error')
    return false
  })
}

function mockDbDown() {
  dbFindOneSpy.mockImplementationOnce(() => {
    throw new Error()
  })
}

function mockDbEmpty() {
  dbFindOneSpy.mockImplementationOnce(() => null)
}

/**
 * Redirect API integration tests. I.E UrlRepository is not mocked but redis and sequelize are.
 */
describe('redirect API tests', () => {
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'

  beforeEach(() => {
    container
      .bind<CookieArrayReducerServiceInterface>(DependencyIds.cookieReducer)
      .to(CookieArrayReducerMockVisited)
    container
      .bind<UrlRepositoryInterface>(DependencyIds.urlRepository)
      .toConstantValue(repository)
    container
      .bind<AnalyticsLogger>(DependencyIds.analyticsLogging)
      .to(AnalyticsLoggerMock)
    container
      .bind<RedirectServiceInterface>(DependencyIds.redirectService)
      .to(RedirectService)
    container
      .bind<RedirectController>(DependencyIds.redirectController)
      .to(RedirectController)
    container
      .bind<CrawlerCheckServiceInterface>(DependencyIds.crawlerCheckService)
      .to(CrawlerCheckService)
    container
      .bind<LinkStatisticsServiceInterface>(DependencyIds.linkStatisticsService)
      .toConstantValue(linkStatisticsServiceMock)
    redisMockClient.flushall()
  })
  afterEach(() => {
    container.unbindAll()
    loggerErrorSpy.mockClear()
    updateStatisticsSpy.mockClear()
    dbFindOneSpy.mockClear()
    cacheGetSpy.mockClear()
  })

  test('url exists in cache and db, real user unvisited', async () => {
    const cookieReducer = new CookieArrayReducerMockUnvisited()
    container.unbind(DependencyIds.cookieReducer)
    container
      .bind<CookieArrayReducerServiceInterface>(DependencyIds.cookieReducer)
      .toConstantValue(cookieReducer)
    redisMockClient.set('aaa', 'aa')
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] = userAgent

    const cookieSpy = jest.spyOn(cookieReducer, 'writeShortlinkToCookie')

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', userAgent)
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(200)
    expect(res._getRedirectUrl()).toBe('')
    expect(cookieReducer.writeShortlinkToCookie).toHaveBeenCalledWith(
      undefined,
      'aaa',
    )

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
    cookieSpy.mockClear()
  })

  test('url exists in cache and db, real user visited', async () => {
    const cookieReducer = new CookieArrayReducerMockVisited()
    container.unbind(DependencyIds.cookieReducer)
    container
      .bind<CookieArrayReducerServiceInterface>(DependencyIds.cookieReducer)
      .toConstantValue(cookieReducer)
    redisMockClient.set('aaa', 'aa')
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] = userAgent

    const cookieSpy = jest.spyOn(cookieReducer, 'writeShortlinkToCookie')

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', userAgent)
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')
    expect(cookieReducer.writeShortlinkToCookie).toHaveBeenCalledWith(
      undefined,
      'aaa',
    )

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
    cookieSpy.mockClear()
  })

  test('url exists in cache and db crawler', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    redisMockClient.set('aaa', 'aa')

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', '')
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
  })

  test('url does not exist in cache but does in db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(updateStatisticsSpy).toBeCalledWith('aaa', '')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
  })

  test('url does not exist in neither cache nor db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockDbEmpty()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledTimes(0)
    expect(res.statusCode).toBe(404)
    expect(res._getRedirectUrl()).toBe('')
  })

  test('url does exists in db but cache is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockCacheDown()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(updateStatisticsSpy).toBeCalledWith('aaa', '')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
  })

  test('both db and cache down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockCacheDown()
    mockDbDown()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(updateStatisticsSpy).toBeCalledTimes(0)
    expect(res.statusCode).toBe(404)
    expect(res._getRedirectUrl()).toBe('')
    expect(logger.error).toBeCalled()
  })

  test('url not in db and cache is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockCacheDown()
    mockDbEmpty()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(res.statusCode).toBe(404)
  })

  test('url not in cache and db is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockDbDown()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(res.statusCode).toBe(404)
    expect(logger.error).toBeCalled()
  })

  test('invalid url', async () => {
    const req = createRequestWithShortUrl(')*')
    const res = httpMocks.createResponse()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(res.statusCode).toBe(404)
  })

  test('no url', async () => {
    const req = createRequestWithShortUrl(undefined)
    const res = httpMocks.createResponse()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(res.statusCode).toBe(404)
  })

  test('url does exists in cache but not db', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    redisMockClient.set('aaa', 'aa')
    mockDbEmpty()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
  })

  test('url in cache and db is down', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    mockDbDown()
    redisMockClient.set('aaa', 'aa')

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')

    expect(isAnalyticsLogged(req, res, 'aaa', 'aa')).toBeTruthy()
  })
})
