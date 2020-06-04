import { container } from './util/inversify'
import { UrlCacheRedis } from './api/cache/url'
import { UrlRepositorySequelize } from './api/repositories/url'
import { GaLogger } from './api/analytics/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducer } from './util/transition-page'
import { OtpCacheRedis } from './api/cache/otp'
import { UserRepositorySequelize } from './api/repositories/user'
import { MailerNode } from './util/email'
import { CryptographyBcrypt } from './util/cryptography'
import { DEV_ENV } from './config'
import { MailerNoOp } from './util/emaildev'
import { S3ServerSide } from './util/aws'
import { S3LocalDev } from './util/localstack'

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
  bindIfUnbound(DependencyIds.cryptography, CryptographyBcrypt)

  if (DEV_ENV) {
    bindIfUnbound(DependencyIds.mailer, MailerNoOp)
    bindIfUnbound(DependencyIds.s3, S3LocalDev)
  } else {
    bindIfUnbound(DependencyIds.mailer, MailerNode)
    bindIfUnbound(DependencyIds.s3, S3ServerSide)
  }
}
