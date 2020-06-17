import { injectable } from 'inversify'
import Express from 'express'
import { AnalyticsLogger } from '../../../../src/server/services/analyticsLogger'

@injectable()
export default class AnalyticsLoggerMock implements AnalyticsLogger {
  lastReq?: Express.Request

  lastRes?: Express.Response

  lastShortUrl?: string

  lastLongUrl?: string

  logRedirectAnalytics = (
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
    longUrl: string,
  ) => {
    this.lastReq = req
    this.lastRes = res
    this.lastShortUrl = shortUrl
    this.lastLongUrl = longUrl
  }

  logTransitionPageServed = (
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
  ) => {
    this.lastReq = req
    this.lastRes = res
    this.lastShortUrl = shortUrl
  }
}
