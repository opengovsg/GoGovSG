export const HOME_PAGE = '/'
export const LOGIN_PAGE = '/login'
export const USER_PAGE = '/user'
export const SEARCH_PAGE = '/search'
export const NOT_FOUND_PAGE = '/404/:shortUrl'
export const DIRECTORY_PAGE = '/directory'

export const snackbarVariants = { ERROR: 0, INFO: 1, SUCCESS: 2 }

enum FormState {
  EMAIL_READY = 'EMAIL_READY',
  EMAIL_PENDING = 'EMAIL_PENDING',
  OTP_READY = 'OTP_READY',
  OTP_PENDING = 'OTP_PENDING',
  RESEND_OTP_DISABLED = 'RESEND_OTP_DISABLED',
}

type VariantKey = keyof typeof FormState
export type VariantType = typeof FormState[VariantKey]

type VariantFlags = {
  [key in VariantKey]: {
    inputEnabled: boolean
    submitEnabled: boolean
    progressBarShown: boolean
    resendEnabled: boolean
  }
}

type LoginFormVariantsTypes = {
  types: typeof FormState
  map: VariantFlags
  isEmailView: (variant: string) => boolean
}

export const loginFormVariants: LoginFormVariantsTypes = {
  types: FormState,
  map: {
    EMAIL_READY: {
      inputEnabled: true,
      submitEnabled: true,
      progressBarShown: false,
      resendEnabled: false,
    },
    EMAIL_PENDING: {
      inputEnabled: false,
      submitEnabled: false,
      progressBarShown: true,
      resendEnabled: false,
    },
    OTP_READY: {
      inputEnabled: true,
      submitEnabled: true,
      progressBarShown: false,
      resendEnabled: true,
    },
    OTP_PENDING: {
      inputEnabled: false,
      submitEnabled: false,
      progressBarShown: true,
      resendEnabled: false,
    },
    RESEND_OTP_DISABLED: {
      inputEnabled: true,
      submitEnabled: true,
      progressBarShown: false,
      resendEnabled: false,
    },
  },
  isEmailView(variant: string) {
    return (
      variant === this.types.EMAIL_PENDING || variant === this.types.EMAIL_READY
    )
  },
}
