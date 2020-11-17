import { variantsValueTypes } from '../../app/util/types'
import { EmailValidatorType } from '../actions/types'

export type LoginState = {
  email: string
  emailValidator: EmailValidatorType
  otp: string
  user: {
    id?: string
  }
  isLoggedIn: boolean
  formVariant: variantsValueTypes
}
