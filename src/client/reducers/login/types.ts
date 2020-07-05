import { loginFormVariants } from '../../util/types'
import { EmailValidatorType } from '../../actions/login/types'

type LoginFormVariantKeys = keyof typeof loginFormVariants.types

export type LoginState = {
  email: string
  emailValidator: EmailValidatorType
  otp: string
  user: {
    id?: string
  }
  isLoggedIn: boolean
  formVariant: typeof loginFormVariants.types[LoginFormVariantKeys]
}
