import Express from 'express'
import jsonMessage from '../../util/json'
import { Mailer } from '../../util/email'
import {
  getOTP,
  logger,
  loginMessage,
  saltRounds,
  validEmailDomainGlobExpression,
} from '../../config'
import { container } from '../../util/inversify'
import { OtpCache } from '../cache/otp'
import { DependencyIds } from '../../constants'
import { UserRepository } from '../repositories/user'
import { Cryptography } from '../../util/cryptography'

import {
  EmailProperty,
  VerifyOtpRequest,
} from '../../../types/server/api/login/handlers.d'

export function getLoginMessage(_: Express.Request, res: Express.Response) {
  res.send(loginMessage)
}

export function getEmailDomains(_: Express.Request, res: Express.Response) {
  res.send(validEmailDomainGlobExpression)
}

export async function generateOtp(req: Express.Request, res: Express.Response) {
  const { setOtpForEmail } = container.get<OtpCache>(DependencyIds.otpCache)
  const { mailOTP } = container.get<Mailer>(DependencyIds.mailer)
  const { hash } = container.get<Cryptography>(DependencyIds.cryptography)

  const { email }: EmailProperty = req.body

  // Generate otp
  const otp = getOTP()
  try {
    // Hash with bcrypt
    const hashedOtp = await hash(otp, saltRounds)

    // Store the hash in a temp table that expires in 5 minutes
    const otpObject = {
      hashedOtp,
      retries: 3,
    }

    try {
      await setOtpForEmail(email, otpObject)
    } catch (saveError) {
      res.serverError(jsonMessage('Could not save OTP hash.'))
      logger.error(`Could not save OTP hash:\t${saveError}`)
      return
    }
    // Email out the otp (nodemailer)
    try {
      await mailOTP(email, otp)
    } catch (error) {
      res.serverError(jsonMessage('Error mailing OTP, please try again later.'))
      logger.error(`Error mailing OTP to ${email}: ${error}`)
      return
    }

    res.ok(jsonMessage('OTP generated and sent.'))
  } catch (error) {
    logger.error(`OTP generation failed unexpectedly:\t${error}`)
    res.serverError(jsonMessage('OTP generation failed unexpectedly.'))
  }
}

export async function verifyOtp(req: Express.Request, res: Express.Response) {
  const { getOtpForEmail, setOtpForEmail, deleteOtpByEmail } = container.get<
    OtpCache
  >(DependencyIds.otpCache)
  const { findOrCreateWithEmail } = container.get<UserRepository>(
    DependencyIds.userRepository,
  )
  const { compare } = container.get<Cryptography>(DependencyIds.cryptography)

  const { email, otp }: VerifyOtpRequest = req.body

  try {
    // Retrieve hash from cache
    const retrievedOtp = await getOtpForEmail(email)

    if (!retrievedOtp) {
      res.unauthorized(jsonMessage('OTP expired/not found.'))
      return
    }

    const isOtpMatch = await compare(otp, retrievedOtp.hashedOtp)

    if (!isOtpMatch) {
      const modifiedOtp = {
        ...retrievedOtp,
        retries: retrievedOtp.retries - 1,
      }
      res.unauthorized(
        jsonMessage(
          `OTP hash verification failed, ${modifiedOtp.retries} attempt(s) remaining.`,
        ),
      )

      if (modifiedOtp.retries > 0) {
        try {
          await setOtpForEmail(email, modifiedOtp)
        } catch (error) {
          logger.error(`OTP retry could not be decremented:\t${error}`)
        }
      } else {
        try {
          await deleteOtpByEmail(email)
        } catch (error) {
          logger.error(
            `Could not delete OTP after reaching retry limit:\t${error}`,
          )
        }
      }
      return
    }

    try {
      const dbUser = await findOrCreateWithEmail(email)

      deleteOtpByEmail(email).catch((error) => {
        logger.error(`OTP could not be expired:\t${error}`)
      })

      req.session!.user = dbUser
      res.ok(jsonMessage('OTP hash verification ok.'))
    } catch (error) {
      res.serverError(jsonMessage('Error creating user.'))
      logger.error(`Error creating user:\t ${email}, ${error}`)
    }
  } catch (error) {
    res.serverError(jsonMessage('Error verifying OTP. Please try again later.'))
    logger.error(`Error verifying OTP:\t${error}`)
  }
}

export function getIsLoggedIn(req: Express.Request, res: Express.Response) {
  const { session } = req
  const { user } = session!
  if (user) {
    const response = { ...jsonMessage('Logged in'), user }
    res.ok(response)
  } else {
    res.notFound(jsonMessage('User session not found'))
  }
}
