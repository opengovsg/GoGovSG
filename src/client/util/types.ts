export const HOME_PAGE = '/'
export const LOGIN_PAGE = '/login'
export const USER_PAGE = '/user'
export const SEARCH_PAGE = '/search'
export const NOT_FOUND_PAGE = '/404/:shortUrl'

export const snackbarVariants = { ERROR: 0, INFO: 1, SUCCESS: 2 }
export const loginFormVariants = {
  types: {
    EMAIL_READY: 'EMAIL_READY',
    EMAIL_PENDING: 'EMAIL_PENDING',
    OTP_READY: 'OTP_READY',
    OTP_PENDING: 'OTP_PENDING',
    RESEND_OTP_DISABLED: 'RESEND_OTP_DISABLED',
  },
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
