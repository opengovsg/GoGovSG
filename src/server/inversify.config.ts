import AWS from 'aws-sdk'

import { ApiClient, ScanApi } from 'cloudmersive-virus-api-client'

import {
  DEV_ENV,
  accessEndpoint,
  bucketEndpoint,
  cloudmersiveKey,
  s3Bucket,
  userAnnouncement,
  userMessage,
} from './config'

import { container } from './util/inversify'
import { DependencyIds } from './constants'
import { OtpRepository } from './repositories/OtpRepository'
import { MailerNode } from './services/email'
import { CryptographyBcrypt } from './services/cryptography'

import { MailerNoOp } from './services/emaildev'
import { S3ServerSide } from './services/aws'
import { UrlRepository } from './repositories/UrlRepository'
import { UserRepository } from './repositories/UserRepository'
import { UrlMapper } from './mappers/UrlMapper'
import { UserMapper } from './mappers/UserMapper'
import { OtpMapper } from './mappers/OtpMapper'
import {
  AnalyticsLoggerService,
  CookieArrayReducerService,
  CrawlerCheckService,
  RedirectService,
} from './modules/redirect/services'
import { RedirectController } from './modules/redirect'
import { GaController } from './controllers/GaController'
import { StatisticsRepository } from './repositories/StatisticsRepository'
import { StatisticsService } from './services/StatisticsService'
import { StatisticsController } from './controllers/StatisticsController'
import { RotatingLinksController } from './controllers/RotatingLinksController'
import { SentryController } from './modules/sentry/SentryController'
import { LoginController } from './controllers/LoginController'
import { AuthService } from './services/AuthService'
import { LogoutController } from './controllers/LogoutController'
import { UrlManagementService } from './services/UrlManagementService'
import { UserController } from './controllers/UserController'
import { QrCodeService } from './services/QrCodeService'
import { DirectoryController } from './controllers/DirectoryController'
import { DirectorySearchService } from './services/DirectorySearchService'
import { LinkStatisticsController } from './controllers/LinkStatisticsController'
import { LinkStatisticsService } from './services/LinkStatisticsService'
import { LinkStatisticsRepository } from './repositories/LinkStatisticsRepository'
import { DeviceCheckService } from './services/DeviceCheckService'

import {
  DEFAULT_ALLOWED_FILE_EXTENSIONS,
  FileTypeFilterService,
} from './services/FileTypeFilterService'
import { CloudmersiveScanService } from './services/CloudmersiveScanService'
import { FileCheckController } from './controllers/FileCheckController'

import { SafeBrowsingMapper } from './mappers/SafeBrowsingMapper'
import { SafeBrowsingRepository } from './repositories/SafeBrowsingRepository'
import { SafeBrowsingService } from './services/SafeBrowsingService'
import { UrlCheckController } from './controllers/UrlCheckController'

function bindIfUnbound<T>(
  dependencyId: symbol,
  impl: { new (...args: any[]): T },
) {
  if (!container.isBound(dependencyId)) {
    container.bind(dependencyId).to(impl)
  }
}

export default () => {
  container.bind(DependencyIds.userMessage).toConstantValue(userMessage)
  container
    .bind(DependencyIds.userAnnouncement)
    .toConstantValue(userAnnouncement)

  bindIfUnbound(DependencyIds.urlRepository, UrlRepository)
  bindIfUnbound(DependencyIds.urlMapper, UrlMapper)
  bindIfUnbound(DependencyIds.userMapper, UserMapper)
  bindIfUnbound(DependencyIds.otpMapper, OtpMapper)
  bindIfUnbound(DependencyIds.analyticsLoggerService, AnalyticsLoggerService)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducerService)
  bindIfUnbound(DependencyIds.otpRepository, OtpRepository)
  bindIfUnbound(DependencyIds.userRepository, UserRepository)
  bindIfUnbound(DependencyIds.cryptography, CryptographyBcrypt)
  bindIfUnbound(DependencyIds.redirectController, RedirectController)
  bindIfUnbound(DependencyIds.gaController, GaController)
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
  bindIfUnbound(DependencyIds.directorySearchService, DirectorySearchService)
  bindIfUnbound(DependencyIds.directoryController, DirectoryController)
  bindIfUnbound(DependencyIds.deviceCheckService, DeviceCheckService)

  container
    .bind(DependencyIds.allowedFileExtensions)
    .toConstantValue(DEFAULT_ALLOWED_FILE_EXTENSIONS)
  bindIfUnbound(DependencyIds.fileTypeFilterService, FileTypeFilterService)

  if (cloudmersiveKey) {
    const client = ApiClient.instance
    const ApiKey = client.authentications.Apikey
    ApiKey.apiKey = cloudmersiveKey
  }
  const api = new ScanApi()

  container.bind(DependencyIds.cloudmersiveKey).toConstantValue(cloudmersiveKey)
  container.bind(DependencyIds.cloudmersiveClient).toConstantValue(api)

  bindIfUnbound(DependencyIds.virusScanService, CloudmersiveScanService)
  bindIfUnbound(DependencyIds.fileCheckController, FileCheckController)

  bindIfUnbound(DependencyIds.safeBrowsingMapper, SafeBrowsingMapper)
  bindIfUnbound(DependencyIds.safeBrowsingRepository, SafeBrowsingRepository)
  bindIfUnbound(DependencyIds.urlThreatScanService, SafeBrowsingService)
  bindIfUnbound(DependencyIds.urlCheckController, UrlCheckController)

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
