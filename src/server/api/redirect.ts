import Express from 'express'
import { UAParser } from 'ua-parser-js'
import { logger } from '../config'
import { NotFoundError } from '../util/error'
import parseDomain from '../util/domain'
import { container } from '../util/inversify'
import { UrlCache } from './cache/url'
import { UrlRepository } from './repositories/url'
import { DependencyIds } from '../constants'
import { AnalyticsLogger } from './analytics/analyticsLogger'
import { CookieReducer } from '../util/transitionPage'

const ERROR_404_PATH = '404.error.ejs'
const TRANSITION_PATH = 'transition-page.ejs'

/**
 * Looks up the longUrl given a shortUrl from the cache, falling back
 * to the database. The cache is re-populated if the database lookup is
 * performed successfully.
 * @param {string} shortUrl
 * @returns {Promise<string>}
 * @throws {NotFoundError}
 */
async function getLongUrlFromStore(shortUrl: string): Promise<string> {
  const { getLongUrlFromCache, cacheShortUrl } = container.get<UrlCache>(
    DependencyIds.urlCache,
  )
  const { getLongUrlFromDatabase } = container.get<UrlRepository>(
    DependencyIds.urlRepository,
  )

  try {
    // Cache lookup
    return await getLongUrlFromCache(shortUrl)
  } catch {
    // Cache failed, look in database
    const longUrl = await getLongUrlFromDatabase(shortUrl)
    cacheShortUrl(shortUrl, longUrl).catch((error) =>
      logger.error(`Unable to cache short URL: ${error}`),
    )
    return longUrl
  }
}

/**
 * Checks whether the input short url is valid.
 * @param {string} shortUrl
 * @returns {boolean}
 */
function isValidShortUrl(shortUrl: string): boolean {
  return !shortUrl || !/^[a-zA-Z0-9-]+$/.test(shortUrl)
}

/**
 * Determine if a user-agent string is likely to be a crawler's.
 * @param ua User-agent string.
 */
function isCrawler(ua: string): boolean {
  const parser = new UAParser(ua)
  const result = parser.getResult()
  if (result.browser.name && result.engine.name && result.os.name) {
    return false
  }
  return true
}

/**
 * The redirect function.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 */
export default async function redirect(
  req: Express.Request,
  res: Express.Response,
) {
  const { incrementClick } = container.get<UrlRepository>(
    DependencyIds.urlRepository,
  )
  const { logRedirectAnalytics } = container.get<AnalyticsLogger>(
    DependencyIds.analyticsLogging,
  )
  const { userHasVisitedShortlink, writeShortlinkToCookie } = container.get<
    CookieReducer
  >(DependencyIds.cookieReducer)

  let { shortUrl } = req.params

  // Short link must consist of valid characters
  if (isValidShortUrl(shortUrl)) {
    res.status(404).render(ERROR_404_PATH, { shortUrl })
    return
  }
  shortUrl = shortUrl.toLowerCase()

  try {
    // Find longUrl to redirect to
    const longUrl = await getLongUrlFromStore(shortUrl)

    // Update clicks in database
    incrementClick(shortUrl).catch((error) =>
      logger.error(`Unable to increment click count: ${error}`),
    )

    // Google analytics
    logRedirectAnalytics(req, res, shortUrl, longUrl)

    // Redirect immediately if a crawler is visiting the site
    if (isCrawler(req.get('user-agent') || '')) {
      res.status(302).redirect(longUrl)
      return
    }

    const renderTransitionPage = !userHasVisitedShortlink(
      req.session!.visits,
      shortUrl,
    )
    req.session!.visits = writeShortlinkToCookie(req.session!.visits, shortUrl)

    if (renderTransitionPage) {
      // Extract root domain from long url.
      const rootDomain: string = parseDomain(longUrl)

      res.status(200).render(TRANSITION_PATH, {
        longUrl,
        rootDomain,
      })
      return
    }
    res.status(302).redirect(longUrl)
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      logger.error(`Redirect error: ${error} ${error instanceof NotFoundError}`)
    }

    res.status(404).render(ERROR_404_PATH, { shortUrl })
  }
}
