import { injectable } from 'inversify'
import Express from 'express'
import { AnalyticsLogger } from '../../../../src/server/services/analyticsLogger'

@injectable()
export default class AnalyticsLoggerMock implements AnalyticsLogger {
  lastReq?: Express.Request

  lastShortUrl?: string

  lastLongUrl?: string

  logRedirectAnalytics = (
    req: Express.Request,
    shortUrl: string,
    longUrl: string,
  ) => {
    this.lastReq = req
    this.lastShortUrl = shortUrl
    this.lastLongUrl = longUrl
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (cookie) return null
    return null
  }
}
