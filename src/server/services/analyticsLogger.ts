import { injectable } from 'inversify'
import fetch from 'cross-fetch'
import { gaTrackingId, logger } from '../config'
import IGaPageViewForm from './googleAnalytics/types/IGaPageViewForm'
import { generateCookie } from './googleAnalytics'

const gaEndpoint = 'https://www.google-analytics.com/collect'

export interface AnalyticsLogger<T> {
  /**
   * @param {T} pageViewHit - A page view request payload.
   */
  logRedirectAnalytics: (pageViewHit: T) => void

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null
}

@injectable()
export class GaLogger implements AnalyticsLogger<IGaPageViewForm> {
  logRedirectAnalytics: (pageViewHit: IGaPageViewForm) => void = (
    pageViewHit,
  ) => {
    if (!gaTrackingId) return

    const body = new URLSearchParams(
      (pageViewHit as unknown) as Record<string, string>,
    )

    fetch(gaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then((response) => {
      if (!response.ok) {
        logger.error(
          `GA tracking failure:\tError: ${response.statusText}\thttpResponse: ${response}\t body:${response.body}`,
        )
      }
    })
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (!gaTrackingId) return null
    return generateCookie(cookie)
  }
}
