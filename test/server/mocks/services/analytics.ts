import { injectable } from 'inversify'
import IGaPageViewForm from '../../../../src/server/services/analytics/types/IGaPageViewForm'
import { AnalyticsLoggerService } from '../../../../src/server/services/interfaces/AnalyticsLoggerService'

@injectable()
export default class AnalyticsLoggerMock
  implements AnalyticsLoggerService<IGaPageViewForm> {
  lastPageViewHit?: IGaPageViewForm

  logRedirectAnalytics = (pageViewHit: IGaPageViewForm) => {
    this.lastPageViewHit = pageViewHit
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (cookie) return JSON.parse(cookie)
    return null
  }
}
