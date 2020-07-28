import Express from 'express'
import { inject, injectable } from 'inversify'
import { gaTrackingId, logger } from '../config'
import { NotFoundError } from '../util/error'
import parseDomain from '../util/domain'
import { DependencyIds, ERROR_404_PATH } from '../constants'
import { AnalyticsLoggerService } from '../services/interfaces/AnalyticsLoggerService'
import { RedirectControllerInterface } from './interfaces/RedirectControllerInterface'
import { RedirectService } from '../services/RedirectService'
import { RedirectType } from '../services/types'
import { EventAction, EventCategory } from '../services/analytics/types/enum'
import { createPageViewHit } from '../services/analytics'
import IGaPageViewForm from '../services/analytics/types/IGaPageViewForm'

const TRANSITION_PATH = 'transition-page.ejs'
const GTAG_PATH = 'gtag.ejs'

@injectable()
export class RedirectController implements RedirectControllerInterface {
  private redirectService: RedirectService

  private analyticsLogger: AnalyticsLoggerService<IGaPageViewForm>

  public constructor(
    @inject(DependencyIds.redirectService) redirectService: RedirectService,
    @inject(DependencyIds.analyticsLoggerService)
    analyticsLogger: AnalyticsLoggerService<IGaPageViewForm>,
  ) {
    this.redirectService = redirectService
    this.analyticsLogger = analyticsLogger
  }

  private logRedirect: (
    req: Express.Request,
    shortUrl: string,
    longUrl: string,
  ) => void = (req, shortUrl, longUrl) => {
    const pageViewHit = createPageViewHit(req, shortUrl.toLowerCase(), longUrl)
    if (pageViewHit) {
      this.analyticsLogger.logRedirectAnalytics(pageViewHit)
    }
  }

  public gtagForTransitionPage: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res
      .status(200)
      .header('content-type', 'text/javascript')
      .render(GTAG_PATH, {
        gaTrackingId,
        gaEventType: EventCategory.TRANSITION_PAGE,
        gaOnLoad: EventAction.LOADED,
        gaOnProceed: EventAction.PROCEEDED,
      })
  }

  public redirect: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { shortUrl }: { shortUrl: string } = req.params

    // Short link must not be null
    if (!shortUrl) {
      res.status(404).render(ERROR_404_PATH, { shortUrl })
      return
    }

    // Find longUrl to redirect to.
    try {
      const {
        longUrl,
        visitedUrls,
        redirectType,
      } = await this.redirectService.redirectFor(
        shortUrl,
        req.session!.visits,
        req.get('user-agent') || '',
        req.get('referrer') || '',
      )

      const generatedCookie = this.analyticsLogger.generateCookie(
        req.headers.cookie,
      )
      if (generatedCookie) {
        res.cookie(...generatedCookie)
      }

      req.session!.visits = visitedUrls

      if (redirectType === RedirectType.TransitionPage) {
        // Extract root domain from long url.
        const rootDomain: string = parseDomain(longUrl)

        res.status(200).render(TRANSITION_PATH, {
          escapedLongUrl: RedirectController.encodeLongUrl(longUrl),
          rootDomain,
          gaTrackingId,
        })
        this.logRedirect(req, shortUrl, longUrl)
        return
      }
      res.status(302).redirect(longUrl)
      this.logRedirect(req, shortUrl, longUrl)
      return
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        logger.error(
          `Redirect error: ${error} ${error instanceof NotFoundError}`,
        )
      }

      res.status(404).render(ERROR_404_PATH, { shortUrl })
      return
    }
  }

  /**
   * Encodes the long URL to be template safe. Currently this function
   * only templates the double-quote character as it is invalid according
   * to [RFC 3986](https://tools.ietf.org/html/rfc3986#appendix-C).
   * @param {string} longUrl The long URL before templating.
   * @return {string} The template-safe URL.
   */
  private static encodeLongUrl(longUrl: string) {
    return longUrl.replace(/["]/g, encodeURIComponent)
  }
}

export default RedirectController
