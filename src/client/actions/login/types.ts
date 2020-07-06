export const GET_OTP_EMAIL_SUCCESS = 'GET_OTP_EMAIL_SUCCESS'
export const GET_OTP_EMAIL_PENDING = 'GET_OTP_EMAIL_PENDING'
export const GET_OTP_EMAIL_ERROR = 'GET_OTP_EMAIL_ERROR'
export const VERIFY_OTP_ERROR = 'VERIFY_OTP_ERROR'
export const VERIFY_OTP_PENDING = 'VERIFY_OTP_PENDING'
export const RESEND_OTP_PENDING = 'RESEND_OTP_PENDING'
export const RESEND_OTP_DISABLED = 'RESEND_OTP_DISABLED'
export const SET_OTP = 'SET_OTP'
export const SET_EMAIL = 'SET_EMAIL'
export const SET_EMAIL_VALIDATOR = 'SET_EMAIL_VALIDATOR'
export const IS_LOGGED_IN_SUCCESS = 'IS_LOGGED_IN_SUCCESS'
export const IS_LOGGED_OUT = 'IS_LOGGED_OUT'

export type GetOtpEmailSuccessAction = {
  type: typeof GET_OTP_EMAIL_SUCCESS
  payload: string
}

export type GetOtpEmailPendingAction = {
  type: typeof GET_OTP_EMAIL_PENDING
}

export type GetOtpEmailErrorAction = {
  type: typeof GET_OTP_EMAIL_ERROR
}

export type VerifyOtpErrorAction = {
  type: typeof VERIFY_OTP_ERROR
}

export type VerifyOtpPendingAction = {
  type: typeof VERIFY_OTP_PENDING
}
export type ResendOtpPendingAction = {
  type: typeof RESEND_OTP_PENDING
}

export type ResendOtpDisabledAction = {
  type: typeof RESEND_OTP_DISABLED
}

export type SetOtpAction = {
  type: typeof SET_OTP
  payload: string
}

export type SetEmailAction = {
  type: typeof SET_EMAIL
  payload: string
}

export type EmailValidatorType = (email: string) => Boolean

export type SetEmailValidatorAction = {
  type: typeof SET_EMAIL_VALIDATOR
  payload: EmailValidatorType
}

export type IsLoggedInSuccessAction = {
  type: typeof IS_LOGGED_IN_SUCCESS
  payload: { id: string }
}

export type IsLoggedOutAction = {
  type: typeof IS_LOGGED_OUT
}

export type LoginActionType =
  | IsLoggedOutAction
  | IsLoggedInSuccessAction
  | SetEmailValidatorAction
  | SetEmailAction
  | SetOtpAction
  | ResendOtpDisabledAction
  | ResendOtpPendingAction
  | VerifyOtpPendingAction
  | VerifyOtpErrorAction
  | GetOtpEmailErrorAction
  | GetOtpEmailPendingAction
  | GetOtpEmailSuccessAction
