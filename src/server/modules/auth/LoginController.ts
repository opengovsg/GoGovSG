import Express, { RequestHandler } from 'express'
import { inject, injectable } from 'inversify'
import {
  DEV_ENV,
  logger,
  loginMessage,
  validEmailDomainGlobExpression,
} from '../../config'
import { DependencyIds } from '../../constants'
import jsonMessage from '../../util/json'
import { AuthService } from './interfaces'
import { InvalidOtpError, NotFoundError } from '../../util/error'
import { EmailProperty, VerifyOtpRequest } from '.'
import getIp from '../../util/request'
import dogstatsd, {
  OTP_GENERATE_FAILURE,
  OTP_GENERATE_SUCCESS,
  OTP_VERIFY_FAILURE,
  OTP_VERIFY_SUCCESS,
  SSO_LOGIN_FAILURE,
  SSO_LOGIN_SUCCESS,
} from '../../util/dogstatsd'
import { GovLoginService } from '../govlogin/interfaces'

@injectable()
export class LoginController {
  private authService: AuthService

  private govLoginService: GovLoginService

  constructor(
    @inject(DependencyIds.authService) authService: AuthService,
    @inject(DependencyIds.govLoginService) govLoginService: GovLoginService,
  ) {
    this.authService = authService
    this.govLoginService = govLoginService
  }

  public getLoginMessage: (
    req: Express.Request,
    res: Express.Response,
  ) => void = (_, res) => {
    res.send(loginMessage)
    return
  }

  public getEmailDomains: (
    req: Express.Request,
    res: Express.Response,
  ) => void = (_, res) => {
    res.send(validEmailDomainGlobExpression)
    return
  }

  public getGovLoginRedirectUrl: RequestHandler = async (_req, res) => {
    try {
      const redirectUrl = this.govLoginService.createRedirectUrl()
      return res.json({ redirectUrl })
    } catch (error) {
      return res.serverError(jsonMessage(error.message))
    }
  }

  public handleGovLoginRedirectCallback: RequestHandler<
    unknown,
    unknown,
    unknown,
    { code?: string; iss?: string }
  > = async (req, res) => {
    let clientTarget = DEV_ENV ? 'http://localhost:3000/' : '/'
    if (!req.query.code) {
      clientTarget += '!#/login?error=missingCode'
      logger.warn('Missing code in GovLogin redirect callback')
      return res.redirect(clientTarget)
    }
    try {
      // sub is the unique identifier for the user
      // if it exists, user is successfully logged in on GovLogin
      const { sub: email } = await this.govLoginService.retrieveAccessToken(
        req.query.code,
      )
      // Log the user in to our app too.
      // TODO: Reject user if user fails our own login checks
      const user = await this.authService.processSsoSuccess(email)
      req.session!.user = user

      dogstatsd.increment(SSO_LOGIN_SUCCESS, 1, 1)
      logger.info(`SSO login success for user:\t${user.email}`)
      return res.redirect(clientTarget)
    } catch (error) {
      clientTarget += '!#/login?error=loginFailed'
      dogstatsd.increment(SSO_LOGIN_FAILURE, 1, 1)
      logger.error(`SSO login failure: ${error}`)

      return res.redirect(clientTarget)
    }
  }

  public generateOtp: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { email }: EmailProperty = req.body

    try {
      await this.authService.generateOtp(email, getIp(req))
    } catch (error) {
      dogstatsd.increment(OTP_GENERATE_FAILURE, 1, 1)
      res.serverError(jsonMessage(error.message))
      return
    }

    dogstatsd.increment(OTP_GENERATE_SUCCESS, 1, 1)
    res.ok(jsonMessage('OTP generated and sent.'))
    return
  }

  public verifyOtp: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { email, otp }: VerifyOtpRequest = req.body

    try {
      const user = await this.authService.verifyOtp(email, otp)
      req.session!.user = user
      res.ok(jsonMessage('OTP hash verification ok.'))
      dogstatsd.increment(OTP_VERIFY_SUCCESS, 1, 1)
      logger.info(`OTP login success for user:\t${user.email}`)
      return
    } catch (error) {
      dogstatsd.increment(OTP_VERIFY_FAILURE, 1, 1)
      if (error instanceof InvalidOtpError) {
        res.unauthorized(
          jsonMessage(
            `OTP hash verification failed, ${error.retries} attempt(s) remaining.`,
          ),
        )
        logger.error(`Login OTP verification failed for user:\t${email}`)
        return
      }
      if (error instanceof NotFoundError) {
        res.unauthorized(jsonMessage('OTP expired/not found.'))
        logger.error(`Login email not found for user:\t${email}`)
        return
      }
      res.serverError(jsonMessage(error.message))
      return
    }
  }

  public getIsLoggedIn: (req: Express.Request, res: Express.Response) => void =
    (req, res) => {
      const { session } = req
      const { user } = session!
      if (user) {
        const response = { ...jsonMessage('Logged in'), user }
        res.ok(response)
        return
      }
      res.notFound(jsonMessage('User session not found'))
      return
    }
}

export default LoginController
