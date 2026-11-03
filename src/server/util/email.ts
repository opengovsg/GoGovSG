import { createEmailSchema } from '@opengovsg/validators/email'
import validator from 'validator'
import { emailValidator } from '../config.js'

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

// Sequelize `validate.is` takes a RegExp. minimatch 11 removed Minimatch#makeRe().
// Custom validators still run when the value is null; the old builtin skipped null.
export function assertWhitelistedEmail(email: string | null | undefined): void {
  if (email === null || email === undefined) return
  if (!emailValidator.match(email)) {
    throw new Error('Email domain is not whitelisted.')
  }
}

export default { isValidGovEmail }
