import Express from 'express'
import { injectable } from 'inversify'
import { generateCookie, sendPageViewHit } from './googleAnalytics'
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
    shortUrl: string,
    longUrl: string,
  ) => void

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null
}

@injectable()
export class GaLogger implements AnalyticsLogger {
  logRedirectAnalytics: (
    req: Express.Request,
    shortUrl: string,
    longUrl: string,
  ) => void = (req, shortUrl, longUrl) => {
    if (!gaTrackingId) return
    sendPageViewHit(req, shortUrl, longUrl)
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (!gaTrackingId) return null
    return generateCookie(cookie)
  }
}
