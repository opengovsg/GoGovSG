import { HasPayload, ReduxAction } from '../../app/actions/types'

export const GET_OTP_EMAIL_SUCCESS = 'GET_OTP_EMAIL_SUCCESS'
export const GET_OTP_EMAIL_PENDING = 'GET_OTP_EMAIL_PENDING'
export const GET_OTP_EMAIL_ERROR = 'GET_OTP_EMAIL_ERROR'
export const VERIFY_OTP_ERROR = 'VERIFY_OTP_ERROR'
export const VERIFY_OTP_PENDING = 'VERIFY_OTP_PENDING'
export const RESEND_OTP_PENDING = 'RESEND_OTP_PENDING'
export const RESEND_OTP_DISABLED = 'RESEND_OTP_DISABLED'
export const SET_EMAIL_VALIDATOR = 'SET_EMAIL_VALIDATOR'
export const IS_LOGGED_IN_SUCCESS = 'IS_LOGGED_IN_SUCCESS'
export const IS_LOGGED_OUT = 'IS_LOGGED_OUT'

export type GetOtpEmailSuccessAction = ReduxAction<
  typeof GET_OTP_EMAIL_SUCCESS
> &
  HasPayload<string>

export type GetOtpEmailPendingAction = ReduxAction<typeof GET_OTP_EMAIL_PENDING>

export type GetOtpEmailErrorAction = ReduxAction<typeof GET_OTP_EMAIL_ERROR> &
  HasPayload<string | undefined>

export type VerifyOtpErrorAction = ReduxAction<typeof VERIFY_OTP_ERROR>

export type VerifyOtpPendingAction = ReduxAction<typeof VERIFY_OTP_PENDING>

export type ResendOtpPendingAction = ReduxAction<typeof RESEND_OTP_PENDING>

export type ResendOtpDisabledAction = ReduxAction<typeof RESEND_OTP_DISABLED>

export type EmailValidatorType = (email: string) => boolean

export type SetEmailValidatorAction = ReduxAction<typeof SET_EMAIL_VALIDATOR> &
  HasPayload<EmailValidatorType>

export type IsLoggedInSuccessAction = ReduxAction<typeof IS_LOGGED_IN_SUCCESS> &
  HasPayload<{ id: string }>

export type IsLoggedOutAction = ReduxAction<typeof IS_LOGGED_OUT>

export type LoginActionType =
  | IsLoggedOutAction
  | IsLoggedInSuccessAction
  | SetEmailValidatorAction
  | ResendOtpDisabledAction
  | ResendOtpPendingAction
  | VerifyOtpPendingAction
  | VerifyOtpErrorAction
  | GetOtpEmailErrorAction
  | GetOtpEmailPendingAction
  | GetOtpEmailSuccessAction
