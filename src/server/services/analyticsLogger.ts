import Express from 'express'
import { injectable } from 'inversify'
import { generateCookie, sendPageViewHit } from '../util/ga'
import { gaTrackingId } from '../config'

export interface AnalyticsLogger {
  /**
   *
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   * @param {String} shortUrl Short url of link.
   * @param {String} longUrl  Long url of link.
   */
  logRedirectAnalytics: (
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
    longUrl: string,
  ) => void
}

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["logRedirectAnalytics"] }] */
@injectable()
export class GaLogger implements AnalyticsLogger {
  logRedirectAnalytics(
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
    longUrl: string,
  ): void {
    if (!gaTrackingId) return
    const cookie = generateCookie(req)
    if (cookie) {
      res.cookie(...cookie)
    }
    sendPageViewHit(req, shortUrl, longUrl)
  }
}
