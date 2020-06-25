import AWS from 'aws-sdk'

import { container } from './util/inversify'
import { GaLogger } from './services/analyticsLogger'
import { DependencyIds } from './constants'
import { CookieArrayReducerService } from './services/CookieArrayReducerService'
import { OtpRepository } from './repositories/OtpRepository'
import { MailerNode } from './services/email'
import { CryptographyBcrypt } from './services/cryptography'
import { DEV_ENV, accessEndpoint, bucketEndpoint, s3Bucket } from './config'
import { MailerNoOp } from './services/emaildev'
import { S3ServerSide } from './services/aws'
import { UrlRepository } from './repositories/UrlRepository'
import { UserRepository } from './repositories/UserRepository'
import { UrlMapper } from './mappers/UrlMapper'
import { UserMapper } from './mappers/UserMapper'
import { OtpMapper } from './mappers/OtpMapper'
import { RedirectService } from './services/RedirectService'
import { RedirectController } from './controllers/RedirectController'
import { CrawlerCheckService } from './services/CrawlerCheckService'
import { StatisticsRepository } from './repositories/StatisticsRepository'
import { StatisticsService } from './services/StatisticsService'
import { StatisticsController } from './controllers/StatisticsController'
import { RotatingLinksController } from './controllers/RotatingLinksController'
import { SentryController } from './controllers/SentryController'
import { LoginController } from './controllers/LoginController'
import { AuthService } from './services/AuthService'
import { LogoutController } from './controllers/LogoutController'
import { UrlManagementService } from './services/UrlManagementService'
import { UserController } from './controllers/UserController'
import { QrCodeService } from './services/QrCodeService'
import { LinkStatisticsController } from './controllers/LinkStatisticsController'
import { LinkStatisticsService } from './services/LinkStatisticsService'
import { LinkStatisticsRepository } from './repositories/LinkStatisticsRepository'
import { DeviceCheckService } from './services/DeviceCheckService'

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
  bindIfUnbound(DependencyIds.otpMapper, OtpMapper)
  bindIfUnbound(DependencyIds.analyticsLogging, GaLogger)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducerService)
  bindIfUnbound(DependencyIds.otpRepository, OtpRepository)
  bindIfUnbound(DependencyIds.userRepository, UserRepository)
  bindIfUnbound(DependencyIds.cryptography, CryptographyBcrypt)
  bindIfUnbound(DependencyIds.redirectController, RedirectController)
  bindIfUnbound(DependencyIds.redirectService, RedirectService)
  bindIfUnbound(DependencyIds.crawlerCheckService, CrawlerCheckService)
  bindIfUnbound(DependencyIds.statisticsController, StatisticsController)
  bindIfUnbound(DependencyIds.statisticsRepository, StatisticsRepository)
  bindIfUnbound(DependencyIds.statisticsService, StatisticsService)
  bindIfUnbound(DependencyIds.linksController, RotatingLinksController)
  bindIfUnbound(DependencyIds.sentryController, SentryController)
  bindIfUnbound(DependencyIds.loginController, LoginController)
  bindIfUnbound(DependencyIds.authService, AuthService)
  bindIfUnbound(DependencyIds.logoutController, LogoutController)
  bindIfUnbound(DependencyIds.urlManagementService, UrlManagementService)
  bindIfUnbound(DependencyIds.userController, UserController)
  bindIfUnbound(DependencyIds.qrCodeService, QrCodeService)
  bindIfUnbound(DependencyIds.deviceCheckService, DeviceCheckService)

  bindIfUnbound(
    DependencyIds.linkStatisticsController,
    LinkStatisticsController,
  )
  bindIfUnbound(DependencyIds.linkStatisticsService, LinkStatisticsService)
  bindIfUnbound(
    DependencyIds.linkStatisticsRepository,
    LinkStatisticsRepository,
  )

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
