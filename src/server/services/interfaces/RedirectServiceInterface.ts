import { RedirectResult } from '../types'

export interface RedirectServiceInterface {
  /**
   * Gets the redirect type and destination for the given short url.
   * @param  {string} shortUrl The short url to redirect for.
   * @param  {string[]} pastVisits The short urls that the user has visited in the past.
   * @param  {string} userAgent The user agent for the user.
   * @param  {string} referrer The source which referred the user to this short url.
   * @returns Promise that resolves to the redirect type and destination and new past visits.
   */
  redirectFor(
    shortUrl: string,
    pastVisits: string[],
    userAgent: string,
    referrer: string,
  ): Promise<RedirectResult>
}
