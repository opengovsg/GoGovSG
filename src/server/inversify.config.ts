import AWS from 'aws-sdk'

import { container } from './util/inversify'
import { GaLogger } from './api/analytics/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducer } from './services/transition-page'
import { OtpCacheRedis } from './api/cache/otp'
import { MailerNode } from './services/email'
import { CryptographyBcrypt } from './services/cryptography'
import { DEV_ENV, accessEndpoint, bucketEndpoint, s3Bucket } from './config'
import { MailerNoOp } from './services/emaildev'
import { S3ServerSide } from './services/aws'
import { UrlRepository } from './repositories/UrlRepository'
import { UserRepository } from './repositories/UserRepository'
import { UrlMapper } from './mappers/UrlMapper'
import { UserMapper } from './mappers/UserMapper'

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
  bindIfUnbound(DependencyIds.urlMapper, UrlMapper)
  bindIfUnbound(DependencyIds.userMapper, UserMapper)
  bindIfUnbound(DependencyIds.analyticsLogging, GaLogger)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducer)
  bindIfUnbound(DependencyIds.otpCache, OtpCacheRedis)
  bindIfUnbound(DependencyIds.userRepository, UserRepository)
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
