import * as Joi from '@hapi/joi'
import validator from 'validator'
import { emailValidator } from '../../config'

/**
 * Checks if an email is valid and whether it follows a specified regex pattern.
 * @param email The email to be validated.
 */
function isValidGovEmail(email: string) {
  return validator.isEmail(email) && emailValidator.match(email)
}

export const otpVerificationSchema = Joi.object({
  email: Joi.string()
    .custom((email: string, helpers) => {
      if (!isValidGovEmail(email)) {
        return helpers.message({ message: 'Not a valid gov email' })
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
        return helpers.message({
          message: 'Invalid email provided. Email domain is not whitelisted.',
        })
      }
      return email
    })
    .required(),
})
