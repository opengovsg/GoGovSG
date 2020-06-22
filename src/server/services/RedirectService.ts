import { inject, injectable } from 'inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'
import { logger } from '../config'
import { NotFoundError } from '../util/error'
import { CrawlerCheckServiceInterface } from './interfaces/CrawlerCheckServiceInterface'
import { RedirectServiceInterface } from './interfaces/RedirectServiceInterface'
import { RedirectResult, RedirectType } from './types'
import { CookieArrayReducerServiceInterface } from './CookieArrayReducerService'

@injectable()
export class RedirectService implements RedirectServiceInterface {
  private urlRepository: UrlRepositoryInterface

  private crawlerCheckService: CrawlerCheckServiceInterface

  private cookieArrayReducerService: CookieArrayReducerServiceInterface

  public constructor(
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
    @inject(DependencyIds.crawlerCheckService)
    crawlerCheckService: CrawlerCheckServiceInterface,
    @inject(DependencyIds.cookieReducer)
    cookieArrayReducerService: CookieArrayReducerServiceInterface,
  ) {
    this.urlRepository = urlRepository
    this.crawlerCheckService = crawlerCheckService
    this.cookieArrayReducerService = cookieArrayReducerService
  }

  public redirectFor: (
    shortUrl: string,
    pastVisits: string[],
    userAgent: string,
  ) => Promise<RedirectResult> = async (rawShortUrl, pastVisits, userAgent) => {
    // Short link must consist of valid characters
    if (RedirectService.isValidShortUrl(rawShortUrl)) {
      throw new NotFoundError('Invalid Url')
    }

    const shortUrl = rawShortUrl.toLowerCase()

    // Find longUrl to redirect to
    const longUrl = await this.urlRepository.getLongUrl(shortUrl)

    // Update clicks in database
    this.urlRepository
      .incrementClick(shortUrl)
      .catch((error) =>
        logger.error(`Unable to increment click count: ${error}`),
      )

    // Update click statistics for link.
    this.urlRepository
      .updateDailyStatistics(shortUrl, userAgent)
      .catch((error) =>
        logger.error(`Unable to update link statistics: ${error}`),
      )

    if (this.crawlerCheckService.isCrawler(userAgent)) {
      return {
        longUrl,
        visitedUrls: pastVisits,
        redirectType: RedirectType.Direct,
      }
    }

    const renderTransitionPage = !this.cookieArrayReducerService.userHasVisitedShortlink(
      pastVisits,
      shortUrl,
    )
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
