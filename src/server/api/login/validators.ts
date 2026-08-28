import { z } from 'zod'

import { logger } from '../../config.js'
import { isValidGovEmail } from '../../util/email.js'
import { govEmailSchema } from '../shared/schemas.js'

export const otpVerificationSchema = z.object({
  email: z
    .string()
    .superRefine((email) => {
      if (!isValidGovEmail(email)) {
        logger.error(
          `OTP verification request rejected due to invalid email:\t${email}`,
        )
      }
    })
    .pipe(govEmailSchema('Not a valid gov email')),
  otp: z
    .string()
    .regex(/^[A-Za-z0-9]{6}$/, 'OTP must be 6 alphanumeric characters.'),
})

export const otpGenerationSchema = z.object({
  email: z
    .string()
    .superRefine((email) => {
      if (!isValidGovEmail(email)) {
        logger.error(
          `OTP generation request rejected due to invalid email:\t${email}`,
        )
      }
    })
    .pipe(
      govEmailSchema(
        'Invalid email provided. Email domain is not whitelisted.',
      ),
    ),
})
