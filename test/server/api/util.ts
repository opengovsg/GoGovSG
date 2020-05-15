/* eslint-disable import/no-extraneous-dependencies */

import { Request, Response } from 'express'
import httpMocks from 'node-mocks-http'
import redisMock from 'redis-mock'
import SequelizeMock from 'sequelize-mock'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { UrlCache } from '../../../src/server/api/cache/url'
import { UrlRepository } from '../../../src/server/api/repositories/url'
import { AnalyticsLogger } from '../../../src/server/api/analytics/analyticsLogger'
import AnalyticsLoggerMock from './mocks/analytics'
import { ACTIVE } from '../../../src/server/models/types'
import { OtpCache } from '../../../src/server/api/cache/otp'

/**
 * Retrieves the currently binded UrlCache in the Inversify container.
 * @returns UrlCache.
 */
export function getUrlCache(): UrlCache {
  return container.get<UrlCache>(DependencyIds.urlCache)
}

/**
 * Retrieves the currently binded UrlCache in the Inversify container.
 * @returns UrlCache.
 */
export function getOtpCache(): OtpCache {
  return container.get<OtpCache>(DependencyIds.otpCache)
}

/**
 * Retrieves the currently binded UrlRepository in the Inversify container.
 * @returns UrlRepository.
 */
export function getUrlRepository(): UrlRepository {
  return container.get<UrlRepository>(DependencyIds.urlRepository)
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
export function isAnalyticsLogged(
  req: Request,
  res: Response,
  shortUrl: string,
  longUrl: string,
): boolean {
  const logger = container.get<AnalyticsLogger>(
    DependencyIds.analyticsLogging,
  ) as AnalyticsLoggerMock

  return (
    logger.lastReq === req &&
    logger.lastRes === res &&
    logger.lastShortUrl === shortUrl &&
    logger.lastLongUrl === longUrl
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

const sequelizeMock = new SequelizeMock()
export const urlModelMock = sequelizeMock.define('url', {
  shortUrl: 'a',
  longUrl: 'aa',
  state: ACTIVE,
  clicks: 0,
  increment: () => {},
})

export const userModelMock = {
  findOrCreate: ({ where: { email } }: { where: { email: string } }) =>
    Promise.resolve([
      {
        get: () => email,
      },
      {},
    ]),
}

export const redisMockClient = redisMock.createClient()
