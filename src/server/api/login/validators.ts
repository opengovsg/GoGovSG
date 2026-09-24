import Joi from 'joi'
import { logger } from '../../config.js'
import { isValidGovEmail } from '../../util/email.js'
import {
  OTP_FORMAT_ERROR_MESSAGE,
  OTP_REGEX,
} from '../../../shared/util/validation.js'

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
  otp: Joi.string().pattern(OTP_REGEX).required().messages({
    'string.pattern.base': OTP_FORMAT_ERROR_MESSAGE,
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
