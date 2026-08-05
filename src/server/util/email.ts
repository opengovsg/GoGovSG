import { createEmailSchema } from '@opengovsg/validators'
import validator from 'validator'
import { emailValidator } from '../config'

// Validates well-formedness only (no domain restriction).
// Domain checking is handled separately by emailValidator.
const wellFormedEmailSchema = createEmailSchema()

/**
 * Checks if an email is valid and whether it follows a specified regex pattern.
 * @param email The email to be validated.
 */
export function isValidGovEmail(email: string) {
  return (
    validator.isEmail(email) &&
    emailValidator.match(email) &&
    wellFormedEmailSchema.safeParse(email).success
  )
}

export default { isValidGovEmail }
