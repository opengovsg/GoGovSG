import { IMinimatch } from 'minimatch'
import { loginFormVariants } from '../../util/types'

type LoginFormVariantKeys = keyof typeof loginFormVariants.types

export type LoginState = {
  email: string
  emailValidator: IMinimatch
  otp: string
  user: {
    id?: string
  }
  isLoggedIn: boolean
  formVariant: typeof loginFormVariants.types[LoginFormVariantKeys]
}
