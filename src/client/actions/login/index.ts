import { IMinimatch, Minimatch } from 'minimatch'
import { Dispatch } from 'redux'
import {
  GET_OTP_EMAIL_ERROR,
  GET_OTP_EMAIL_PENDING,
  GET_OTP_EMAIL_SUCCESS,
  GetOtpEmailErrorAction,
  GetOtpEmailPendingAction,
  GetOtpEmailSuccessAction,
  IS_LOGGED_IN_SUCCESS,
  IS_LOGGED_OUT,
  IsLoggedInSuccessAction,
  IsLoggedOutAction,
  LoginActionType,
  RESEND_OTP_DISABLED,
  RESEND_OTP_PENDING,
  ResendOtpDisabledAction,
  ResendOtpPendingAction,
  SET_EMAIL,
  SET_EMAIL_VALIDATOR,
  SET_OTP,
  SetEmailAction,
  SetEmailValidatorAction,
  SetOtpAction,
  VERIFY_OTP_ERROR,
  VERIFY_OTP_PENDING,
  VerifyOtpErrorAction,
  VerifyOtpPendingAction,
} from './types'
import { loginFormVariants } from '../../util/types'
import { get, postJson } from '../../util/requests'
import userActions from '../user'
import rootActions from '../root'
import { defaultEmailValidationGlobExpression } from '../../reducers/login'
import { UserActionType } from '../user/types'
import { AllActions, AllThunkDispatch, GetReduxState } from '../types'

const isGetOTPSuccess: (email: string) => GetOtpEmailSuccessAction = (
  email,
) => ({
  type: GET_OTP_EMAIL_SUCCESS,
  payload: email,
})

const isGetOTPPending: () => GetOtpEmailPendingAction = () => ({
  type: GET_OTP_EMAIL_PENDING,
})

const isGetOTPError: (errorMessage?: string) => GetOtpEmailErrorAction = (
  errorMessage,
) => ({
  type: GET_OTP_EMAIL_ERROR,
  payload: errorMessage,
})

const setEmail: (payload: string) => SetEmailAction = (payload) => ({
  type: SET_EMAIL,
  payload,
})

const setEmailValidator: (payload: IMinimatch) => SetEmailValidatorAction = (
  payload,
) => ({ type: SET_EMAIL_VALIDATOR, payload })

const setOTP: (payload: string) => SetOtpAction = (payload) => ({
  type: SET_OTP,
  payload,
})

const isVerifyOTPError: () => VerifyOtpErrorAction = () => ({
  type: VERIFY_OTP_ERROR,
})

const isVerifyOTPPending: () => VerifyOtpPendingAction = () => ({
  type: VERIFY_OTP_PENDING,
})

const isResendOTPSuccess = isGetOTPSuccess

const isResendOTPPending: () => ResendOtpPendingAction = () => ({
  type: RESEND_OTP_PENDING,
})

const isResendOTPError = isVerifyOTPError

const isResendOTPDisabled: (
  errorMessage?: string,
) => ResendOtpDisabledAction = (errorMessage) => ({
  type: RESEND_OTP_DISABLED,
  payload: errorMessage,
})

const isLoggedInSuccess: (user: { id: string }) => IsLoggedInSuccessAction = (
  user,
) => ({
  type: IS_LOGGED_IN_SUCCESS,
  payload: user,
})
const isLoggedOut: () => IsLoggedOutAction = () => ({ type: IS_LOGGED_OUT })

const getEmailValidationGlobExpression = () => (
  dispatch: Dispatch<LoginActionType>,
  getState: GetReduxState,
) => {
  const { login } = getState()
  const { emailValidator } = login
  if (emailValidator !== defaultEmailValidationGlobExpression) return
  get('/api/login/emaildomains').then((response) => {
    if (response.ok) {
      response.text().then((expression) => {
        const validator = new Minimatch(expression, {
          noext: true,
          noglobstar: true,
          nobrace: true,
          nonegate: true,
        })
        dispatch(setEmailValidator(validator))
      })
    }
  })
}

/**
 * Called when user enters email and waits for OTP.
 */
const getOTPEmail = () => (
  dispatch: Dispatch<AllActions>,
  getState: GetReduxState,
) => {
  dispatch(rootActions.closeSnackbar())

  const { login } = getState()
  const { email, formVariant } = login
  let pendingAction: () => void
  let successAction: () => void
  let errorAction: () => void

  const disableResendForDuration = (duration = 20000) => {
    dispatch(isResendOTPDisabled())
    // reenable after duration
    setTimeout(() => dispatch(isResendOTPSuccess(email)), duration)
  }
  if (loginFormVariants.isEmailView(formVariant)) {
    pendingAction = () => dispatch(isGetOTPPending())
    successAction = () => {
      dispatch(isGetOTPSuccess(email))
      disableResendForDuration()
    }
    errorAction = () => dispatch(isGetOTPError())
  } else {
    pendingAction = () => dispatch(isResendOTPPending())
    successAction = () => disableResendForDuration()
    errorAction = () => dispatch(isResendOTPError())
  }

  pendingAction()
  return postJson('/api/login/otp', { email })
    .then((response) => {
      if (response.ok) {
        successAction()
        return null
      }
      return response.json().then((json) => {
        const { message } = json
        errorAction()
        dispatch(rootActions.setErrorMessage(message))
      })
    })
    .catch(() => {
      errorAction()
      dispatch(rootActions.setErrorMessage('Network connectivity failed.'))
      return null
    })
}

// Checks if there is an existing session.
const isLoggedIn = () => (dispatch: Dispatch<LoginActionType>) =>
  get('/api/login/isLoggedIn').then((response) => {
    const isOk = response.ok
    return response.json().then((json) => {
      if (isOk) {
        const { user } = json
        dispatch(isLoggedInSuccess(user))
      } else {
        dispatch(isLoggedOut())
      }
    })
  })

/**
 * Called when user enters OTP and submits for verification.
 */
const verifyOTP = () => (
  dispatch: AllThunkDispatch,
  getState: GetReduxState,
) => {
  dispatch(rootActions.closeSnackbar())

  const { login } = getState()
  const { email, otp } = login

  dispatch(isVerifyOTPPending())
  return postJson('/api/login/verify', { email, otp }).then((response) => {
    const isOk = !!response.ok
    return response.json().then((json) => {
      if (isOk) {
        dispatch(rootActions.setInfoMessage('OTP Verified'))
        dispatch(isLoggedIn())
      } else {
        const { message } = json
        dispatch(isVerifyOTPError())
        dispatch(rootActions.setErrorMessage(message))
      }
    })
  })
}

const logout = () => (dispatch: Dispatch<LoginActionType | UserActionType>) =>
  get('/api/logout').then((response) => {
    if (response.ok) {
      dispatch(isLoggedOut())

      // Wipe user data on log out.
      dispatch(userActions.wipeUserState())
    } else {
      console.error(response)
    }
  })

export default {
  getEmailValidationGlobExpression,
  getOTPEmail,
  verifyOTP,
  setOTP,
  setEmail,
  isLoggedIn,
  logout,
}
