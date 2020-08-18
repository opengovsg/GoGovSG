import { inject, injectable } from 'inversify'
import { Cryptography } from './cryptography'
import { Mailer } from './email'
import { OtpRepositoryInterface } from '../repositories/interfaces/OtpRepositoryInterface'
import { DependencyIds } from '../constants'
import { getOTP, logger, saltRounds } from '../config'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'
import { StorableOtp, StorableUser } from '../repositories/types'
import { AuthServiceInterface } from './interfaces/AuthServiceInterface'
import { InvalidOtpError, NotFoundError } from '../util/error'

@injectable()
export class AuthService implements AuthServiceInterface {
  private cryptography: Cryptography

  private mailer: Mailer

  private otpRepository: OtpRepositoryInterface

  private userRepository: UserRepositoryInterface

  constructor(
    @inject(DependencyIds.cryptography) cryptography: Cryptography,
    @inject(DependencyIds.mailer) mailer: Mailer,
    @inject(DependencyIds.otpRepository) otpRepository: OtpRepositoryInterface,
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
  ) {
    this.cryptography = cryptography
    this.mailer = mailer
    this.otpRepository = otpRepository
    this.userRepository = userRepository
  }

  public generateOtp: (email: string, ip: string) => Promise<void> = async (
    email,
    ip,
  ) => {
    // Generate otp
    const otp = getOTP()
    try {
      // Hash with bcrypt
      const hashedOtp = await this.cryptography.hash(otp, saltRounds)

      // Store the hash in a temp table that expires in 5 minutes
      const otpObject = {
        hashedOtp,
        retries: 3,
      }

      try {
        await this.otpRepository.setOtpForEmail(email, otpObject)
      } catch (saveError) {
        logger.error(`Could not save OTP hash:\t${saveError}`)
        throw new Error('Could not save OTP hash.')
      }
      // Email out the otp (nodemailer)
      try {
        await this.mailer.mailOTP(email, otp, ip)
      } catch (error) {
        logger.error(`Error mailing OTP to ${email}: ${error}`)
        throw new Error('Error mailing OTP, please try again later.')
      }
    } catch (error) {
      logger.error(`OTP generation failed unexpectedly:\t${error}`)
      throw new Error('OTP generation failed unexpectedly.')
    }
  }

  public verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<StorableUser> = async (email, otp) => {
    let retrievedOtp: StorableOtp | null = null
    // Retrieve hash from cache
    try {
      retrievedOtp = await this.otpRepository.getOtpForEmail(email)
    } catch (error) {
      logger.error(`Error verifying OTP:\t${error}`)
      throw error
    }

    if (!retrievedOtp) {
      throw new NotFoundError('Missing otp')
    }

    const isOtpMatch = await this.cryptography.compare(
      otp,
      retrievedOtp.hashedOtp,
    )

    if (!isOtpMatch) {
      const modifiedOtp = {
        ...retrievedOtp,
        retries: retrievedOtp.retries - 1,
      }

      if (modifiedOtp.retries > 0) {
        try {
          await this.otpRepository.setOtpForEmail(email, modifiedOtp)
        } catch (error) {
          logger.error(`OTP retry could not be decremented:\t${error}`)
        }
      } else {
        try {
          await this.otpRepository.deleteOtpByEmail(email)
        } catch (error) {
          logger.error(
            `Could not delete OTP after reaching retry limit:\t${error}`,
          )
        }
      }
      throw new InvalidOtpError(modifiedOtp.retries)
    }

    try {
      const dbUser = await this.userRepository.findOrCreateWithEmail(email)

      this.otpRepository.deleteOtpByEmail(email).catch((error) => {
        logger.error(`OTP could not be expired:\t${error}`)
      })

      return dbUser
    } catch (error) {
      logger.error(`Error creating user:\t ${email}, ${error}`)
      throw new Error('Error creating user.')
    }
  }
}

export default AuthService
