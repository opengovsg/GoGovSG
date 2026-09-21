import Express from 'express'
import { inject, injectable } from 'inversify'
import { CallbackParamsType } from 'openid-client'
import { DependencyIds } from '../../constants.js'
import {
  cookieSettings,
  displayHostname,
  logger,
  oneGovSgIssuer,
} from '../../config.js'
import { isValidGovEmail } from '../../util/email.js'
import assetVariant from '../../../shared/util/asset-variant.js'
import {
  AuthService,
  OneGovSgService,
  OneGovSgTransaction,
} from './interfaces/index.js'

// Cross-site top-level navigations (the callback landing from one.gov.sg)
// never carry a SameSite=Strict cookie, so the transaction is held in its
// own short-lived, SameSite=Lax signed cookie instead of the main session.
const TRANSACTION_COOKIE_NAME = 'oneGovSgTransaction'
const TRANSACTION_COOKIE_MAX_AGE_MS = 5 * 60 * 1000

// The client passes the hash route it was bounced from (e.g. /user/links)
// so the callback can land there. Only a local absolute path is accepted.
const localPath = (next: unknown): string | undefined =>
  typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : undefined

// Full detail goes to the server log; the browser only sees a generic page.
const describeError = (error: unknown): string =>
  error instanceof Error ? error.stack || error.message : String(error)

const renderError = (
  res: Express.Response,
  status: number,
  heading: string,
  body: string,
) => {
  res
    .status(status)
    .render('error.ejs', { assetVariant, displayHostname, heading, body })
}

const renderLoginFailed = (res: Express.Response, status = 400) =>
  renderError(
    res,
    status,
    `We couldn't sign you in to ${displayHostname} with one.gov.sg.`,
    'Please try logging in again.',
  )

// Guide step 6: deny with a 403 page, never a redirect back to login.
const renderForbidden = (res: Express.Response) =>
  renderError(
    res,
    403,
    `You don't have access to ${displayHostname}.`,
    `Please contact your agency's ${displayHostname} administrator if you believe this is a mistake.`,
  )

const regenerateSession: (req: Express.Request) => Promise<void> = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()))
  })

const setTransactionCookie = (
  res: Express.Response,
  transaction: OneGovSgTransaction,
) => {
  res.cookie(TRANSACTION_COOKIE_NAME, JSON.stringify(transaction), {
    httpOnly: true,
    secure: cookieSettings.secure,
    sameSite: 'lax',
    maxAge: TRANSACTION_COOKIE_MAX_AGE_MS,
    signed: true,
  })
}

const readAndClearTransactionCookie = (
  req: Express.Request,
  res: Express.Response,
): OneGovSgTransaction | null => {
  const raw = req.signedCookies[TRANSACTION_COOKIE_NAME]
  res.clearCookie(TRANSACTION_COOKIE_NAME)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

@injectable()
export class OneGovSgController {
  private authService: AuthService

  private oneGovSgService: OneGovSgService

  constructor(
    @inject(DependencyIds.authService) authService: AuthService,
    @inject(DependencyIds.oneGovSgService) oneGovSgService: OneGovSgService,
  ) {
    this.authService = authService
    this.oneGovSgService = oneGovSgService
  }

  /**
   * Starts a one.gov.sg login. Also serves as the registered
   * initiate_login_uri (guide step 9): an `iss` query param is validated
   * against the configured issuer if present, then the same fresh flow
   * runs regardless (no shortcuts for the app-launcher case).
   */
  public login: (req: Express.Request, res: Express.Response) => Promise<void> =
    async (req, res) => {
      const { iss } = req.query
      if (iss !== undefined && iss !== oneGovSgIssuer) {
        logger.error(`one.gov.sg initiate_login_uri issuer mismatch:\t${iss}`)
        renderLoginFailed(res)
        return
      }

      try {
        const transaction = {
          ...this.oneGovSgService.createTransaction(),
          next: localPath(req.query.next),
        }
        setTransactionCookie(res, transaction)
        res.redirect(
          await this.oneGovSgService.getAuthorizationUrl(transaction),
        )
      } catch (error) {
        logger.error(
          `one.gov.sg login initiation failed:\t${describeError(error)}`,
        )
        renderLoginFailed(res, 500)
      }
    }

  public callback: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const transaction = readAndClearTransactionCookie(req, res)

    if (!transaction) {
      logger.error('one.gov.sg callback received with no pending transaction')
      renderLoginFailed(res)
      return
    }

    // Guide step 3 ordering: error, iss, code. state/nonce/PKCE are checked
    // by openid-client inside handleCallback.
    const params = req.query as CallbackParamsType
    if (params.error) {
      logger.error(
        `one.gov.sg callback returned an error:\t${params.error}\t${
          params.error_description ?? ''
        }`,
      )
      renderLoginFailed(res)
      return
    }
    if (params.iss !== oneGovSgIssuer) {
      logger.error(`one.gov.sg callback issuer mismatch:\t${params.iss}`)
      renderLoginFailed(res)
      return
    }
    if (!params.code) {
      logger.error('one.gov.sg callback missing authorization code')
      renderLoginFailed(res)
      return
    }

    let email: string
    try {
      email = await this.oneGovSgService.handleCallback(params, transaction)
    } catch (error) {
      logger.error(
        `one.gov.sg callback verification failed:\t${describeError(error)}`,
      )
      renderLoginFailed(res)
      return
    }

    // one.gov.sg authenticates any officer; access to this product is our
    // call, gated before anything is provisioned (guide step 6).
    if (!isValidGovEmail(email)) {
      logger.error(`one.gov.sg login denied for email:\t${email}`)
      renderForbidden(res)
      return
    }

    try {
      const user = await this.authService.genDBUserWithOfficerEmail(email)
      await regenerateSession(req)
      req.session.user = user
      logger.info(`one.gov.sg login success for user:\t${user.email}`)
      res.redirect(transaction.next ? `/#${transaction.next}` : '/')
    } catch (error) {
      logger.error(
        `one.gov.sg user provisioning failed:\t${describeError(error)}`,
      )
      renderLoginFailed(res, 500)
    }
  }
}

export default OneGovSgController
