import { injectable } from 'inversify'
import { AnalyticsLogger } from '../../../../src/server/services/analyticsLogger'
import IGaPageViewForm from '../../../../src/server/services/googleAnalytics/types/IGaPageViewForm'

@injectable()
export default class AnalyticsLoggerMock
  implements AnalyticsLogger<IGaPageViewForm> {
  lastPageViewHit?: IGaPageViewForm

  logRedirectAnalytics = (pageViewHit: IGaPageViewForm) => {
    this.lastPageViewHit = pageViewHit
  }

  generateCookie: (
    cookie?: string,
  ) => [string, string, { maxAge: number }] | null = (cookie) => {
    if (cookie) return null
    return null
  }
}
