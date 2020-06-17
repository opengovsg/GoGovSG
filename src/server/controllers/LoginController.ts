import Express from 'express'
import { inject, injectable } from 'inversify'
import { LoginControllerInterface } from './interfaces/LoginControllerInterface'
import { loginMessage, validEmailDomainGlobExpression } from '../config'
import { DependencyIds } from '../constants'
import jsonMessage from '../util/json'
import { AuthServiceInterface } from '../services/interfaces/AuthServiceInterface'
import { InvalidOtpError, NotFoundError } from '../util/error'
import {
  EmailProperty,
  VerifyOtpRequest,
} from '../../types/server/controllers/LoginController'

@injectable()
export class LoginController implements LoginControllerInterface {
  private authService: AuthServiceInterface

  constructor(
    @inject(DependencyIds.authService) authService: AuthServiceInterface,
  ) {
    this.authService = authService
  }

  public getLoginMessage: (
    req: Express.Request,
    res: Express.Response,
  ) => void = (_, res) => {
    res.send(loginMessage)
  }

  public getEmailDomains: (
    req: Express.Request,
    res: Express.Response,
  ) => void = (_, res) => {
    res.send(validEmailDomainGlobExpression)
  }

  public generateOtp: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (req, res) => {
    const { email }: EmailProperty = req.body

    try {
      await this.authService.generateOtp(email)
    } catch (error) {
      res.serverError(jsonMessage(error.message))
    }

    res.ok(jsonMessage('OTP generated and sent.'))
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
    } catch (error) {
      if (error instanceof InvalidOtpError) {
        res.unauthorized(
          jsonMessage(
            `OTP hash verification failed, ${error.retries} attempt(s) remaining.`,
          ),
        )
      } else if (error instanceof NotFoundError) {
        res.unauthorized(jsonMessage('OTP expired/not found.'))
      } else {
        res.serverError(jsonMessage(error.message))
      }
    }
  }

  public getIsLoggedIn: (
    req: Express.Request,
    res: Express.Response,
  ) => void = (req, res) => {
    const { session } = req
    const { user } = session!
    if (user) {
      const response = { ...jsonMessage('Logged in'), user }
      res.ok(response)
    } else {
      res.notFound(jsonMessage('User session not found'))
    }
  }
}

export default LoginController
