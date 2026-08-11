import { VariantType } from '../../app/util/types.js'
import { EmailValidatorType } from '../actions/types.js'

export type LoginState = {
  email: string
  emailValidator: EmailValidatorType
  user: {
    id?: string
  }
  isLoggedIn: boolean
  formVariant: VariantType
}
