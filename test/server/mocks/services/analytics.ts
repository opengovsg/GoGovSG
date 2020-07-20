import { injectable } from 'inversify'
import Express from 'express'
import { AnalyticsLogger } from '../../../../src/server/services/analyticsLogger'
import { createPageViewHit } from '../../../../src/server/services/googleAnalytics'
import IGaPageViewForm from '../../../../src/server/services/googleAnalytics/types/IGaPageViewForm'

@injectable()
export default class AnalyticsLoggerMock implements AnalyticsLogger {
  lastReq?: Express.Request

  lastShortUrl?: string

  lastLongUrl?: string

  lastPageViewHit?: IGaPageViewForm | null

  logRedirectAnalytics = (
    req: Express.Request,
    shortUrl: string,
    longUrl: string,
  ) => {
    this.lastReq = req
    this.lastShortUrl = shortUrl
    this.lastLongUrl = longUrl
    this.lastPageViewHit = createPageViewHit(req, shortUrl, longUrl)
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (cookie) return null
    return null
  }
}
