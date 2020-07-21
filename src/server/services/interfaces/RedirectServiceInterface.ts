import { RedirectResult } from '../types'

export interface RedirectServiceInterface {
  redirectFor(
    shortUrl: string,
    pastVisits: string[],
    userAgent: string,
    referrer: string,
  ): Promise<RedirectResult>
}
