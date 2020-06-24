import validator from 'validator'
import { emailValidator } from '../config'

/**
 * Checks if an email is valid and whether it follows a specified regex pattern.
 * @param email The email to be validated.
 */
export function isValidGovEmail(email: string) {
  return validator.isEmail(email) && emailValidator.match(email)
}

export default { isValidGovEmail }
