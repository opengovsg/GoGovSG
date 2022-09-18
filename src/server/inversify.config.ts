import AWS from 'aws-sdk'

import { ApiClient, ScanApi } from 'cloudmersive-virus-api-client'

import {
  DEV_ENV,
  accessEndpoint,
  bucketEndpoint,
  cloudmersiveKey,
  gaTrackingId,
  linksToRotate,
  ogUrl,
  s3Bucket,
  userAnnouncement,
  userMessage,
} from './config'

import { container } from './util/inversify'
import { DependencyIds } from './constants'
import { OtpRepository } from './modules/auth/repositories'
import { MailerNode } from './services/email'

import { S3ServerSide } from './services/aws'
import { UrlRepository } from './repositories/UrlRepository'
import { UserRepository } from './repositories/UserRepository'
import { TagRepository } from './repositories/TagRepository'
import { UrlMapper } from './mappers/UrlMapper'
import { UserMapper } from './mappers/UserMapper'
import { OtpMapper } from './mappers/OtpMapper'
import { TagMapper } from './mappers/TagMapper'
import {
  AnalyticsLoggerService,
  CookieArrayReducerService,
  CrawlerCheckService,
  RedirectService,
} from './modules/redirect/services'
import { RedirectController } from './modules/redirect'

import { StatisticsRepository } from './modules/statistics/repositories'
import { StatisticsService } from './modules/statistics/services'
import { StatisticsController } from './modules/statistics'

import { RotatingLinksController } from './modules/display/RotatingLinksController'
import { SentryController } from './modules/sentry/SentryController'

import { AuthService, CryptographyBcrypt } from './modules/auth/services'
import { LoginController, LogoutController } from './modules/auth'
import { UrlManagementService } from './modules/user/services'
import { UserController } from './modules/user'
import { DirectoryController } from './modules/directory'
import { DirectorySearchService } from './modules/directory/services'
import { GaController, LinkStatisticsController } from './modules/analytics'
import {
  DeviceCheckService,
  LinkStatisticsService,
} from './modules/analytics/services'
import { LinkStatisticsRepository } from './modules/analytics/repositories/LinkStatisticsRepository'
import { LinkAuditController } from './modules/audit'
import { LinkAuditService } from './modules/audit/services'
import { UrlHistoryRepository } from './modules/audit/repositories'

import { SafeBrowsingMapper } from './modules/threat/mappers'
import { SafeBrowsingRepository } from './modules/threat/repositories/SafeBrowsingRepository'
import { DEFAULT_ALLOWED_FILE_EXTENSIONS } from './modules/threat/services/FileTypeFilterService'
import {
  CloudmersiveScanService,
  FileTypeFilterService,
  SafeBrowsingService,
} from './modules/threat/services'
import { FileCheckController, UrlCheckController } from './modules/threat'

import { QrCodeService } from './modules/qr/services'
import { QrCodeController } from './modules/qr'
import TagManagementService from './modules/user/services/TagManagementService'
import { BulkController } from './modules/bulk'

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
  container.bind(DependencyIds.linksToRotate).toConstantValue(linksToRotate)
  container.bind(DependencyIds.ogUrl).toConstantValue(ogUrl)
  container.bind(DependencyIds.gaTrackingId).toConstantValue(gaTrackingId)

  bindIfUnbound(DependencyIds.urlRepository, UrlRepository)
  bindIfUnbound(DependencyIds.urlMapper, UrlMapper)
  bindIfUnbound(DependencyIds.userMapper, UserMapper)
  bindIfUnbound(DependencyIds.otpMapper, OtpMapper)
  bindIfUnbound(DependencyIds.tagMapper, TagMapper)
  bindIfUnbound(DependencyIds.analyticsLoggerService, AnalyticsLoggerService)
  bindIfUnbound(DependencyIds.cookieReducer, CookieArrayReducerService)
  bindIfUnbound(DependencyIds.otpRepository, OtpRepository)
  bindIfUnbound(DependencyIds.userRepository, UserRepository)
  bindIfUnbound(DependencyIds.tagRepository, TagRepository)
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
  bindIfUnbound(DependencyIds.tagManagementService, TagManagementService)
  bindIfUnbound(DependencyIds.userController, UserController)
  bindIfUnbound(DependencyIds.qrCodeService, QrCodeService)
  bindIfUnbound(DependencyIds.qrCodeController, QrCodeController)
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
  bindIfUnbound(DependencyIds.bulkController, BulkController)

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

  bindIfUnbound(DependencyIds.linkAuditService, LinkAuditService)
  bindIfUnbound(DependencyIds.linkAuditController, LinkAuditController)
  bindIfUnbound(DependencyIds.urlHistoryRepository, UrlHistoryRepository)

  container.bind(DependencyIds.s3Bucket).toConstantValue(s3Bucket)

  bindIfUnbound(DependencyIds.mailer, MailerNode)

  if (DEV_ENV) {
    const s3Client = new AWS.S3({
      credentials: {
        accessKeyId: 'foobar',
        secretAccessKey: 'foobar',
      },
      endpoint: bucketEndpoint,
      s3ForcePathStyle: true,
    })
    container
      .bind(DependencyIds.fileURLPrefix)
      .toConstantValue(`${accessEndpoint}/`)
    container.bind(DependencyIds.s3Client).toConstantValue(s3Client)
  } else {
    container.bind(DependencyIds.fileURLPrefix).toConstantValue('https://')
    container.bind(DependencyIds.s3Client).toConstantValue(new AWS.S3())
  }

  bindIfUnbound(DependencyIds.s3, S3ServerSide)
}
