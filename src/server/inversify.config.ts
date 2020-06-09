import AWS from 'aws-sdk'

import { container } from './util/inversify'
import { GaLogger } from './api/analytics/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducer } from './util/transition-page'
import { OtpCacheRedis } from './api/cache/otp'
import { UserRepositorySequelize } from './api/repositories/user'
import { MailerNode } from './util/email'
import { CryptographyBcrypt } from './util/cryptography'
import { DEV_ENV, accessEndpoint, bucketEndpoint, s3Bucket } from './config'
import { MailerNoOp } from './util/emaildev'
import { S3ServerSide } from './util/aws'
import { UrlRepository } from './repositories/UrlRepository'

function bindIfUnbound<T>(
  dependencyId: symbol,
  impl: { new (...args: any[]): T },
) {
  if (!container.isBound(dependencyId)) {
    container.bind(dependencyId).to(impl)
  }
}

export default () => {
  bindIfUnbound(DependencyIds.urlRepository, UrlRepository)
  bindIfUnbound(DependencyIds.analyticsLogging, GaLogger)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducer)
  bindIfUnbound(DependencyIds.otpCache, OtpCacheRedis)
  bindIfUnbound(DependencyIds.userRepository, UserRepositorySequelize)
  bindIfUnbound(DependencyIds.cryptography, CryptographyBcrypt)

  container.bind(DependencyIds.s3Bucket).toConstantValue(s3Bucket)

  if (DEV_ENV) {
    const s3Client = new AWS.S3({
      credentials: {
        accessKeyId: 'foobar',
        secretAccessKey: 'foobar',
      },
      endpoint: bucketEndpoint,
      s3ForcePathStyle: true,
    })

    bindIfUnbound(DependencyIds.mailer, MailerNoOp)
    container
      .bind(DependencyIds.fileURLPrefix)
      .toConstantValue(`${accessEndpoint}/`)
    container.bind(DependencyIds.s3Client).toConstantValue(s3Client)
  } else {
    bindIfUnbound(DependencyIds.mailer, MailerNode)
    container.bind(DependencyIds.fileURLPrefix).toConstantValue('https://')
    container.bind(DependencyIds.s3Client).toConstantValue(new AWS.S3())
  }

  bindIfUnbound(DependencyIds.s3, S3ServerSide)
}
