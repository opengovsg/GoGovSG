/* eslint-disable import/no-extraneous-dependencies */

import { Request } from 'express'
import httpMocks from 'node-mocks-http'
import redisMock from 'redis-mock'
import SequelizeMock from 'sequelize-mock'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import AnalyticsLoggerMock from '../mocks/services/analytics'
import { ACTIVE } from '../../../src/server/models/types'
import { OtpRepositoryInterface } from '../../../src/server/repositories/interfaces/OtpRepositoryInterface'
import { createPageViewHit } from '../../../src/server/services/analytics'
import IGaPageViewForm from '../../../src/server/services/analytics/types/IGaPageViewForm'
import { AnalyticsLoggerService } from '../../../src/server/services/interfaces/AnalyticsLoggerService'

/**
 * Retrieves the currently binded OtpCache in the Inversify container.
 * @returns OtpCache.
 */
export function getOtpCache(): OtpRepositoryInterface {
  return container.get<OtpRepositoryInterface>(DependencyIds.otpRepository)
}

/**
 * Checks if the AnalyticsLogger in the Inversify container has been used to
 * log a redirect instance.
 * @param  {Request} req The request that triggered the redirect.
 * @param  {Response} res The response returned to the client.
 * @param  {string} shortUrl The short url of the request.
 * @param  {string} longUrl The long url that is returned to the client.
 * @returns Boolean.
 */
export function expectAnalyticsLogged(
  req: Request,
  shortUrl: string,
  longUrl: string,
): void {
  const logger = container.get<AnalyticsLoggerService<IGaPageViewForm>>(
    DependencyIds.analyticsLoggerService,
  ) as AnalyticsLoggerMock
  expect(logger.lastPageViewHit).toEqual(
    createPageViewHit(req, shortUrl, longUrl),
  )
}

/**
 * Creates a mock request with the input short Url.
 * @param  {string} shortUrl
 * @returns A mock Request with the input short Url.
 */
export function createRequestWithShortUrl(
  shortUrl: string | undefined,
): Request {
  return httpMocks.createRequest({
    params: {
      shortUrl,
    },
    body: {},
    session: {},
  })
}

/**
 * Creates a mock request with the input session user.
 * @param  {any} user
 * @returns A mock Request with the input session user.
 */
export function createRequestWithUser(user: any): Request {
  return httpMocks.createRequest({
    session: {
      user,
    },
    body: {},
  })
}

/**
 * Creates a mock request with the input email in request body.
 * @param  {any} user
 * @returns A mock Request with the input email.
 */
export function createRequestWithEmail(email: any): Request {
  return httpMocks.createRequest({
    session: {},
    body: {
      email,
    },
    ip: '1.1.1.1',
  })
}

/**
 * Creates a mock request with the input email and otp in request body.
 * @param  {any} user
 * @returns A mock Request with the input email and otp.
 */
export function createRequestWithEmailAndOtp(email: any, otp: any): Request {
  return httpMocks.createRequest({
    session: {},
    body: {
      email,
      otp,
    },
  })
}

/**
 * Creates a mock request with mock file in request body.
 * @param  {any} user
 * @returns A mock Request with mock file.
 */
export function createRequestWithFile(file: any): Request {
  return httpMocks.createRequest({
    files: { file },
  })
}

export class MockSequelizeTransaction {
  fn: Function | null

  constructor() {
    this.fn = null
  }

  transaction(fn: () => Promise<void>): Promise<void> {
    this.fn = fn
    return Promise.resolve()
  }
}

export const sequelizeMock = new SequelizeMock()

export const urlModelMock = sequelizeMock.define(
  'url',
  {
    shortUrl: 'a',
    longUrl: 'aa',
    state: ACTIVE,
    clicks: 8,
  },
  {
    instanceMethods: {
      findOne: () => {},
      increment: () => {},
    },
  },
)

export const clicksModelMock = sequelizeMock.define(
  'daily_stats',
  [
    {
      shortUrl: 'a',
      date: '2020-06-28',
      clicks: 4,
    },
    {
      shortUrl: 'a',
      date: '2020-06-25',
      clicks: 2,
    },
    {
      shortUrl: 'a',
      date: '2020-06-21',
      clicks: 2,
    },
  ],
  {
    instanceMethods: {
      increment: () => {},
    },
  },
)

export const heatMapModelMock = sequelizeMock.define(
  'weekday_stats',
  [
    {
      shortUrl: 'a',
      weekday: 0,
      clicks: 4,
    },
    {
      shortUrl: 'a',
      weekday: 6,
      clicks: 4,
    },
    {
      shortUrl: 'a',
      weekday: 2,
      clicks: 4,
    },
  ],
  {
    instanceMethods: {
      increment: () => {},
    },
  },
)

export const devicesModelMock = sequelizeMock.define(
  'devices_stats',
  {
    shortUrl: 'a',
    mobile: 3,
    tablet: 1,
    desktop: 4,
    others: 0,
  },
  {
    instanceMethods: {
      increment: () => {},
    },
  },
)

export const mockTransaction = sequelizeMock.transaction

export const mockQuery = jest.fn()

export const mockDefine = jest.fn()

mockQuery.mockImplementation((query: string) => {
  if (query.includes('count(*)')) {
    return [{ count: 10 }]
  }
  return [
    {
      shortUrl: 'a',
      longUrl: 'aa',
      state: ACTIVE,
      clicks: 0,
      increment: () => {},
      isFile: false,
      createdAt: 'fakedate',
      updatedAt: 'fakedate',
      isSearchable: true,
      description: 'desc',
      contactEmail: 'aa@aa.com',
    },
  ]
})

export const userModelMock = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  scope: jest.fn(),
  findOrCreate: ({ where: { email } }: { where: { email: string } }) =>
    Promise.resolve([
      {
        get: () => email,
      },
      {},
    ]),
}

export const redisMockClient = redisMock.createClient()
