export interface AnalyticsLoggerService<T> {
  /**
   * @param {T} pageViewHit - A page view request payload.
   */
  logRedirectAnalytics: (pageViewHit: T) => void

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null
}
