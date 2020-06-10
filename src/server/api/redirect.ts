import Express from 'express'
import { UAParser } from 'ua-parser-js'
import { logger } from '../config'
import { NotFoundError } from '../util/error'
import parseDomain from '../util/domain'
import { container } from '../util/inversify'
import { DependencyIds } from '../constants'
import { AnalyticsLogger } from './analytics/analyticsLogger'
import { CookieReducer } from '../util/transition-page'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'

const ERROR_404_PATH = '404.error.ejs'
const TRANSITION_PATH = 'transition-page.ejs'

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
 * Encodes the long URL to be template safe. Currently this function
 * only templates the double-quote character as it is invalid according
 * to [RFC 3986](https://tools.ietf.org/html/rfc3986#appendix-C).
 * @param {string} longUrl The long URL before templating.
 * @return {string} The template-safe URL.
 */
function encodeLongUrl(longUrl: string) {
  return longUrl.replace(/["]/g, encodeURIComponent)
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
  const { logRedirectAnalytics } = container.get<AnalyticsLogger>(
    DependencyIds.analyticsLogging,
  )
  const { userHasVisitedShortlink, writeShortlinkToCookie } = container.get<
    CookieReducer
  >(DependencyIds.cookieReducer)

  const { getLongUrl, incrementClick } = container.get<UrlRepositoryInterface>(
    DependencyIds.urlRepository,
  )

  let { shortUrl }: { shortUrl: string } = req.params

  // Short link must consist of valid characters
  if (isValidShortUrl(shortUrl)) {
    res.status(404).render(ERROR_404_PATH, { shortUrl })
    return
  }
  shortUrl = shortUrl.toLowerCase()

  try {
    // Find longUrl to redirect to
    const longUrl = await getLongUrl(shortUrl)

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
        escapedLongUrl: encodeLongUrl(longUrl),
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
