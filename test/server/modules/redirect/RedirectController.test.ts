/* eslint-disable no-underscore-dangle */
import httpMocks from 'node-mocks-http'
import {
  clicksModelMock,
  createRequestWithShortUrl,
  devicesModelMock,
  heatMapModelMock,
  mockTransaction,
  redisMockClient,
  sequelizeMock,
  urlModelMock,
} from '../../api/util'
import { S3InterfaceMock } from '../../mocks/services/aws'
import { UrlRepository } from '../../../../src/server/repositories/UrlRepository'
import { UrlRepositoryInterface } from '../../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import { container } from '../../../../src/server/util/inversify'
import { DependencyIds } from '../../../../src/server/constants'
import { generateCookie } from '../../../../src/server/services/analytics'

import {
  AnalyticsLoggerService,
  CookieArrayReducerService,
  CrawlerCheckService,
  RedirectService,
} from '../../../../src/server/modules/redirect/services'
import { RedirectController } from '../../../../src/server/modules/redirect'
import { logger } from '../../config'
import { UrlMapper } from '../../../../src/server/mappers/UrlMapper'
import { LinkStatisticsServiceInterface } from '../../../../src/server/services/interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsServiceMock } from '../../mocks/services/LinkStatisticsService'

jest.mock('../../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

jest.mock('../../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

jest.mock('../../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

jest.mock('../../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

jest.mock('../../../../src/server/util/sequelize', () => ({
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

const mockAnalyticsLogger: jest.Mocked<AnalyticsLoggerService> = {
  logRedirectAnalytics: jest.fn(),
  generateCookie: jest.fn(generateCookie),
}

// eslint-disable-next-line no-unused-vars
const writeShortlinkToCookie = jest.fn((_: string[] | null, __: string) => [])

const cookieArrayReducerMockUnvisited: jest.Mocked<CookieArrayReducerService> = {
  // eslint-disable-next-line no-unused-vars
  userHasVisitedShortlink: jest.fn((_: string[] | null, __: string) => false),
  writeShortlinkToCookie,
}

const cookieArrayReducerMockVisited: jest.Mocked<CookieArrayReducerService> = {
  // eslint-disable-next-line no-unused-vars
  userHasVisitedShortlink: jest.fn((_: string[] | null, __: string) => true),
  writeShortlinkToCookie,
}

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
    mockAnalyticsLogger.logRedirectAnalytics.mockClear()
    container
      .bind<CookieArrayReducerService>(DependencyIds.cookieReducer)
      .toConstantValue(cookieArrayReducerMockVisited)
    container
      .bind<UrlRepositoryInterface>(DependencyIds.urlRepository)
      .toConstantValue(repository)
    container
      .bind<AnalyticsLoggerService>(DependencyIds.analyticsLoggerService)
      .toConstantValue(mockAnalyticsLogger)
    container
      .bind<RedirectService>(DependencyIds.redirectService)
      .to(RedirectService)
    container
      .bind<RedirectController>(DependencyIds.redirectController)
      .to(RedirectController)
    container
      .bind<CrawlerCheckService>(DependencyIds.crawlerCheckService)
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
    container.unbind(DependencyIds.cookieReducer)
    container
      .bind<CookieArrayReducerService>(DependencyIds.cookieReducer)
      .toConstantValue(cookieArrayReducerMockUnvisited)
    redisMockClient.set('aaa', 'aa')
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] = userAgent

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', userAgent)
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(200)
    expect(res._getRedirectUrl()).toBe('')
    expect(
      cookieArrayReducerMockUnvisited.writeShortlinkToCookie,
    ).toHaveBeenCalledWith(undefined, 'aaa')
    cookieArrayReducerMockUnvisited.writeShortlinkToCookie.mockClear()
  })

  test('url exists in cache and db, real user visited with cookie', async () => {
    container.unbind(DependencyIds.cookieReducer)
    container
      .bind<CookieArrayReducerService>(DependencyIds.cookieReducer)
      .toConstantValue(cookieArrayReducerMockVisited)
    redisMockClient.set('aaa', 'aa')

    const cookie = { gaClientId: 'SOME-ID' }
    const req = createRequestWithShortUrl('Aaa')
    req.headers.cookie = Object.entries(cookie)
      .map(([k, v]) => `${k}=${v}`)
      .join(';')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] = userAgent

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', userAgent)
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(302)
    expect(res._getRedirectUrl()).toBe('aa')
    expect(
      cookieArrayReducerMockVisited.writeShortlinkToCookie,
    ).toHaveBeenCalledWith(undefined, 'aaa')
    expect(mockAnalyticsLogger.logRedirectAnalytics).toHaveBeenCalled()
    cookieArrayReducerMockVisited.writeShortlinkToCookie.mockClear()
  })

  test('url exists in cache and db, real user visited without cookie', async () => {
    container.unbind(DependencyIds.cookieReducer)
    container
      .bind<CookieArrayReducerService>(DependencyIds.cookieReducer)
      .toConstantValue(cookieArrayReducerMockVisited)
    redisMockClient.set('aaa', 'aa')

    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()
    req.headers['user-agent'] = userAgent

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .redirect(req, res)

    expect(updateStatisticsSpy).toBeCalledWith('aaa', userAgent)
    expect(updateStatisticsSpy).toBeCalledTimes(1)
    expect(res.statusCode).toBe(302)
    expect(res.cookies.gaClientId).toBeTruthy()
    expect(res._getRedirectUrl()).toBe('aa')
    expect(
      cookieArrayReducerMockVisited.writeShortlinkToCookie,
    ).toHaveBeenCalledWith(undefined, 'aaa')

    // This is a bug which has to be fixed
    expect(mockAnalyticsLogger.logRedirectAnalytics).not.toHaveBeenCalled()
    cookieArrayReducerMockVisited.writeShortlinkToCookie.mockClear()
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
  })

  test('retrieval of gtag for transition page', async () => {
    const req = createRequestWithShortUrl('Aaa')
    const res = httpMocks.createResponse()

    await container
      .get<RedirectController>(DependencyIds.redirectController)
      .gtagForTransitionPage(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getHeaders()['content-type']).toBe('text/javascript')
  })
})
