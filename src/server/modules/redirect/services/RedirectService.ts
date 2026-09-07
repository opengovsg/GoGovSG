import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../../../constants'
import { NotFoundError } from '../../../util/error'
import { RedirectResult, RedirectType } from '..'
import { LinkStatisticsService } from '../../analytics/interfaces'
import { logger, ogUrl, safeBrowsingKey } from '../../../config'
import { CookieArrayReducerService, CrawlerCheckService } from '.'
import { UrlThreatScanService } from '../../threat/interfaces'
import { getSafeBrowsingExpiryDate } from '../../../util/safeBrowsing'
import { UrlManagementService } from '../../user/interfaces'

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
      // Only the scan call itself is allowed to fail open: a Web Risk outage
      // should not block the redirect, but a real detected threat (below)
      // must still be handled exactly as before, uninterrupted by a try/catch.
      let isThreat = false
      let scanFailed = false
      try {
        isThreat = await this.urlThreatScanService.isThreat(longUrl)
      } catch (error) {
        scanFailed = true
        // The Web Risk API key is embedded in the scan request URL, so a
        // network-level failure (e.g. a FetchError on DNS/connection errors)
        // can carry it in error.message. Redact it before logging.
        logger.error(
          RedirectService.redactApiKey(
            `Safe Browsing check failed for shortUrl ${shortUrl}, allowing redirect: ${error}`,
          ),
        )
      }

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

      // Leave the expiry unset on a failed scan so it's retried on the next
      // visit, instead of caching an inconclusive result as "safe".
      if (!scanFailed) {
        const expiry = getSafeBrowsingExpiryDate({ longUrl })
        await this.urlRepository.updateSafeBrowsingExpiry(shortUrl, expiry)
      }
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

  /**
   * Strips the Safe Browsing API key out of a string before it is logged.
   * @param {string} value
   * @returns {string}
   */
  private static redactApiKey(value: string): string {
    return safeBrowsingKey
      ? value.split(safeBrowsingKey).join('[REDACTED]')
      : value
  }
}

export default RedirectService
