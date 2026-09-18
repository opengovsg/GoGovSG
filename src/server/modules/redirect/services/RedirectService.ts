import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface.js'
import { DependencyIds } from '../../../constants.js'
import { NotFoundError } from '../../../util/error.js'
import { RedirectResult, RedirectType } from '../types.js'
import { LinkStatisticsService } from '../../analytics/interfaces/index.js'
import { logger, ogUrl } from '../../../config.js'
import { CookieArrayReducerService } from './CookieArrayReducerService.js'
import { CrawlerCheckService } from './CrawlerCheckService.js'
import { UrlThreatScanService } from '../../threat/interfaces/index.js'
import { getSafeBrowsingExpiryDate } from '../../../util/safeBrowsing.js'
import { UrlManagementService } from '../../user/interfaces/index.js'

@injectable()
export class RedirectService {
  private urlRepository: UrlRepositoryInterface

  private crawlerCheckService: CrawlerCheckService

  private cookieArrayReducerService: CookieArrayReducerService

  private linkStatisticsService: LinkStatisticsService

  private urlThreatScanService: UrlThreatScanService

  private urlManagementService: UrlManagementService

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
    @inject(DependencyIds.crawlerCheckService)
    crawlerCheckService: CrawlerCheckService,
    @inject(DependencyIds.cookieReducer)
    cookieArrayReducerService: CookieArrayReducerService,
    @inject(DependencyIds.linkStatisticsService)
    linkStatisticsService: LinkStatisticsService,
    @inject(DependencyIds.urlThreatScanService)
    urlThreatScanService: UrlThreatScanService,
    @inject(DependencyIds.urlManagementService)
    urlManagementService: UrlManagementService,
  ) {
    this.urlRepository = urlRepository
    this.crawlerCheckService = crawlerCheckService
    this.cookieArrayReducerService = cookieArrayReducerService
    this.linkStatisticsService = linkStatisticsService
    this.urlThreatScanService = urlThreatScanService
    this.urlManagementService = urlManagementService
  }

  public redirectFor: (
    shortUrl: string,
    pastVisits: string[] | undefined,
    userAgent: string,
    referrer: string,
  ) => Promise<RedirectResult> = async (
    rawShortUrl,
    pastVisits,
    userAgent,
    referrer,
  ) => {
    // Short link must consist of valid characters
    if (RedirectService.isValidShortUrl(rawShortUrl)) {
      throw new NotFoundError('Invalid Url')
    }

    const shortUrl = rawShortUrl.toLowerCase()

    // Find longUrl to redirect to
    const { longUrl, isFile, safeBrowsingExpiry } =
      await this.urlRepository.getLongUrl(shortUrl)

    // Validate that the longUrl is not a malicious link
    const isSafeBrowsingResultExpired =
      !isFile &&
      (!safeBrowsingExpiry ||
        new Date(safeBrowsingExpiry).getTime() < Date.now())

    if (isSafeBrowsingResultExpired) {
      const isThreat = await this.urlThreatScanService.isThreat(longUrl)
      if (isThreat) {
        logger.warn(
          `Malicious link attempt: ${longUrl} was detected as malicious for shortUrl ${shortUrl}`,
        )

        // Deactivate the short link and warn the short link owner
        await this.urlManagementService.deactivateMaliciousShortUrl(shortUrl)

        // NOTE: We return a 404 error here to make the user experience the same
        // as if the short link was deactivated/not found for simplicity and to
        // avoid inducing user panic.
        throw new NotFoundError('Malicious link detected')
      }
      // Store the result of the threat scan in the database
      const expiry = getSafeBrowsingExpiryDate({ longUrl })
      await this.urlRepository.updateSafeBrowsingExpiry(shortUrl, expiry)
    }

    // Update clicks and click statistics in database.
    try {
      this.linkStatisticsService.updateLinkStatistics(shortUrl, userAgent)
    } catch (e) {
      // updates wrapped in a try-catch block to prevent errors from bubbling up
      logger.warn('error updating link statistics')
    }
    if (this.crawlerCheckService.isCrawler(userAgent)) {
      return {
        longUrl,
        visitedUrls: pastVisits || [],
        redirectType: RedirectType.Direct,
      }
    }

    const isFromTrustedPage = RedirectService.isFromTrustedPage(referrer)

    const renderTransitionPage =
      !this.cookieArrayReducerService.userHasVisitedShortlink(
        pastVisits,
        shortUrl,
      ) && !isFromTrustedPage

    const newVisits = this.cookieArrayReducerService.writeShortlinkToCookie(
      pastVisits,
      shortUrl,
    )

    return {
      longUrl,
      visitedUrls: newVisits,
      redirectType: renderTransitionPage
        ? RedirectType.TransitionPage
        : RedirectType.Direct,
    }
  }

  /**
   * Checks whether the referrer is from a trusted page (same origin as ogUrl).
   * This prevents malicious sites from bypassing the transition page.
   * @param {string} referrer - The referrer URL to check.
   * @returns {boolean} - True if referrer is from trusted origin, false otherwise.
   */
  private static isFromTrustedPage(referrer: string): boolean {
    try {
      const referrerUrl = new URL(referrer)
      const trustedUrl = new URL(ogUrl)
      return referrerUrl.origin === trustedUrl.origin
    } catch {
      // If referrer is not a valid URL, treat as untrusted
      return false
    }
  }

  /**
   * Checks whether the input short url is valid.
   * @param {string} shortUrl
   * @returns {boolean}
   */
  private static isValidShortUrl(shortUrl: string): boolean {
    return !shortUrl || !/^[a-zA-Z0-9-]+$/.test(shortUrl)
  }
}

export default RedirectService
