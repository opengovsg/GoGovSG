import { container } from './util/inversify'
import { UrlCacheRedis } from './api/cache/url'
import { UrlRepositorySequelize } from './api/repositories/url'
import { GaLogger } from './api/analytics/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducer } from './util/transitionPage'
import { OtpCacheRedis } from './api/cache/otp'
import { UserRepositorySequelize } from './api/repositories/user'
import { MailerNode } from './util/email'
import { CryptographyBcrypt } from './util/cryptography'

function bindIfUnbound<T>(dependencyId: symbol, impl: { new (): T }) {
  if (!container.isBound(dependencyId)) {
    container.bind(dependencyId).to(impl)
  }
}

export default () => {
  bindIfUnbound(DependencyIds.urlCache, UrlCacheRedis)
  bindIfUnbound(DependencyIds.urlRepository, UrlRepositorySequelize)
  bindIfUnbound(DependencyIds.analyticsLogging, GaLogger)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducer)
  bindIfUnbound(DependencyIds.otpCache, OtpCacheRedis)
  bindIfUnbound(DependencyIds.userRepository, UserRepositorySequelize)
  bindIfUnbound(DependencyIds.mailer, MailerNode)
  bindIfUnbound(DependencyIds.cryptography, CryptographyBcrypt)
}
