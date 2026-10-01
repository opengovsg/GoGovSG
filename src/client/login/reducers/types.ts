import { VariantType } from '../../app/util/types'
import { EmailValidatorType } from '../actions/types'

export type LoginState = {
  email: string
  emailValidator: EmailValidatorType
  user: {
    id?: string
    email?: string
  }
  isLoggedIn: boolean
  formVariant: VariantType
}
