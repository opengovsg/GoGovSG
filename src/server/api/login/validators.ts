import * as Joi from 'joi'
import { logger } from '../../config.js'
import { isValidGovEmail } from '../../util/email.js'

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
  otp: Joi.string()
    .pattern(/^[A-Za-z0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP must be 6 alphanumeric characters.',
    }),
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
