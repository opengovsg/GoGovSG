import Express from 'express'
import { inject, injectable } from 'inversify'
import {
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
import dogstatsd from '../../util/dogstatsd'

@injectable()
export class LoginController {
  private authService: AuthService

  constructor(@inject(DependencyIds.authService) authService: AuthService) {
    this.authService = authService
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

  public generateOtp: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { email }: EmailProperty = req.body

    try {
      await this.authService.generateOtp(email, getIp(req))
    } catch (error) {
      dogstatsd.increment('otp.generate.failure', 1, 1)
      res.serverError(jsonMessage(error.message))
      return
    }

    dogstatsd.increment('otp.generate.success', 1, 1)
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
      dogstatsd.increment('otp.verify.success', 1, 1)
      logger.info(`OTP login success for user:\t${user.email}`)
      return
    } catch (error) {
      dogstatsd.increment('otp.verify.failure', 1, 1)
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
