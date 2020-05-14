import { container } from './util/inversify'
import { UrlCache, UrlCacheRedis } from './api/cache/url'
import { UrlRepository, UrlRepositorySequelize } from './api/repositories/url'
import { AnalyticsLogger, GaLogger } from './api/analytics/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducer, CookieReducer } from './util/transitionPage'

export default () => {
  if (!container.isBound(DependencyIds.urlCache)) {
    container.bind<UrlCache>(DependencyIds.urlCache).to(UrlCacheRedis)
  }
  if (!container.isBound(DependencyIds.urlRepository)) {
    container
      .bind<UrlRepository>(DependencyIds.urlRepository)
      .to(UrlRepositorySequelize)
  }
  if (!container.isBound(DependencyIds.analyticsLogging)) {
    container.bind<AnalyticsLogger>(DependencyIds.analyticsLogging).to(GaLogger)
  }
  if (!container.isBound(DependencyIds.cookieReducer)) {
    container
      .bind<CookieReducer>(DependencyIds.cookieReducer)
      .to(CookieArrayReducer)
  }
}
