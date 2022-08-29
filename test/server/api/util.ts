/* eslint-disable import/no-extraneous-dependencies */

import { Request } from 'express'
import httpMocks from 'node-mocks-http'
import redisMock from 'redis-mock'
import SequelizeMock from 'sequelize-mock'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { ACTIVE } from '../../../src/server/models/types'
import { OtpRepository } from '../../../src/server/modules/auth/interfaces/OtpRepository'

/**
 * Retrieves the currently binded OtpCache in the Inversify container.
 * @returns OtpCache.
 */
export function getOtpCache(): OtpRepository {
  return container.get<OtpRepository>(DependencyIds.otpRepository)
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
    UrlClicks: {
      clicks: 3,
    },
  },
  {
    instanceMethods: {
      findOne: () => {},
      increment: () => {},
      findByPk: () => {},
    },
  },
)

export const tagModelMock = sequelizeMock.define('tag', {
  tagString: 'Tag',
  tagKey: 'tag',
})

export const urlClicksModelMock = sequelizeMock.define('url_clicks', {
  shortUrl: 'a',
  clicks: 3,
})

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
  // For rawDirectorySearch -> email
  if (query.includes('queryFile')) {
    return [
      {
        email: 'a@test.gov.sg',
        shortUrl: 'a',
        state: ACTIVE,
        isFile: false,
      },
    ]
  }
  if (query.includes('count(*)')) {
    return [{ count: 10 }]
  }
  // For rawDirectorySearch -> plain text
  if (query.includes('JOIN')) {
    return [
      {
        email: 'test@test.gov.sg',
        shortUrl: 'a',
        state: ACTIVE,
        isFile: false,
      },
    ]
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

export const sanitiseMock = (i: string) => {
  return i
}

export const redisMockClient = redisMock.createClient()
