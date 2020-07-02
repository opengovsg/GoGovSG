import * as Joi from '@hapi/joi'
import { logger } from '../../config'
import { isValidGovEmail } from '../../util/email'

export const otpVerificationSchema = Joi.object({
  email: Joi.string()
    .custom((email: string, helpers) => {
      if (!isValidGovEmail(email)) {
        logger.error(
          `OTP verification request rejected due to invalid email:\t${email}`,
        )
        return helpers.message({ custom: 'Not a valid gov email' })
      }
      return email
    })
    .required(),
  otp: Joi.string().required(),
})

export const otpGenerationSchema = Joi.object({
  email: Joi.string()
    .custom((email: string, helpers) => {
      if (!isValidGovEmail(email)) {
        logger.error(
          `OTP generation request rejected due to invalid email:\t${email}`,
        )
        return helpers.message({
          custom: 'Invalid email provided. Email domain is not whitelisted.',
        })
      }
      return email
    })
    .required(),
})
