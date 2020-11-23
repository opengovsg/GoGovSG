import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../../../constants'
import { NotFoundError } from '../../../util/error'
import { RedirectResult, RedirectType } from '..'
import { LinkStatisticsServiceInterface } from '../../../services/interfaces/LinkStatisticsServiceInterface'
import { ogUrl } from '../../../config'
import { CookieArrayReducerService, CrawlerCheckService } from '.'

@injectable()
export class RedirectService {
  private urlRepository: UrlRepositoryInterface

  private crawlerCheckService: CrawlerCheckService

  private cookieArrayReducerService: CookieArrayReducerService

  private linkStatisticsService: LinkStatisticsServiceInterface

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
    @inject(DependencyIds.crawlerCheckService)
    crawlerCheckService: CrawlerCheckService,
    @inject(DependencyIds.cookieReducer)
    cookieArrayReducerService: CookieArrayReducerService,
    @inject(DependencyIds.linkStatisticsService)
    linkStatisticsService: LinkStatisticsServiceInterface,
  ) {
    this.urlRepository = urlRepository
    this.crawlerCheckService = crawlerCheckService
    this.cookieArrayReducerService = cookieArrayReducerService
    this.linkStatisticsService = linkStatisticsService
  }

  public redirectFor: (
    shortUrl: string,
    pastVisits: string[],
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
    const longUrl = await this.urlRepository.getLongUrl(shortUrl)

    // Update clicks and click statistics in database.
    this.linkStatisticsService.updateLinkStatistics(shortUrl, userAgent)

    if (this.crawlerCheckService.isCrawler(userAgent)) {
      return {
        longUrl,
        visitedUrls: pastVisits,
        redirectType: RedirectType.Direct,
      }
    }

    const isFromTrustedPage = referrer.startsWith(ogUrl)

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
   * Checks whether the input short url is valid.
   * @param {string} shortUrl
   * @returns {boolean}
   */
  private static isValidShortUrl(shortUrl: string): boolean {
    return !shortUrl || !/^[a-zA-Z0-9-]+$/.test(shortUrl)
  }
}

export default RedirectService
