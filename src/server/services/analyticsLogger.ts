import Express from 'express'
import { injectable } from 'inversify'
import {
  generateCookie,
  sendPageViewHit,
  sendTpServedEvent,
} from './googleAnalytics'
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

  logTransitionPageServed: (
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
  ) => void
}

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["logRedirectAnalytics", "logTransitionPageServed"] }] */
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

  logTransitionPageServed(
    req: Express.Request,
    res: Express.Response,
    shortUrl: string,
  ) {
    if (!gaTrackingId) return
    const cookie = generateCookie(req)
    if (cookie) {
      res.cookie(...cookie)
    }
    sendTpServedEvent(req, shortUrl)
  }
}
