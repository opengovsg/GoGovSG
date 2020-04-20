import { Minimatch } from 'minimatch'
import {
  GET_OTP_EMAIL_ERROR,
  GET_OTP_EMAIL_PENDING,
  GET_OTP_EMAIL_SUCCESS,
  IS_LOGGED_IN_SUCCESS,
  IS_LOGGED_OUT,
  RESEND_OTP_DISABLED,
  RESEND_OTP_PENDING,
  SET_EMAIL,
  SET_EMAIL_VALIDATOR,
  SET_OTP,
  VERIFY_OTP_ERROR,
  VERIFY_OTP_PENDING,
} from '~/actions/types'
import { loginFormVariants } from '~/util/types'
import { get, postJson } from '~/util/requests'
import userActions from '~/actions/user'
import rootActions from '~/actions/root'
import { defaultEmailValidationGlobExpression } from '~/reducers/login'

const isGetOTPSuccess = (email) => ({
  type: GET_OTP_EMAIL_SUCCESS,
  payload: email,
})

const isGetOTPPending = () => ({
  type: GET_OTP_EMAIL_PENDING,
})

const isGetOTPError = (errorMessage) => ({
  type: GET_OTP_EMAIL_ERROR,
  payload: errorMessage,
})

const setEmail = (payload) => ({ type: SET_EMAIL, payload })

const setEmailValidator = (payload) => ({ type: SET_EMAIL_VALIDATOR, payload })

const setOTP = (payload) => ({ type: SET_OTP, payload })

const isVerifyOTPError = () => ({
  type: VERIFY_OTP_ERROR,
})

const isVerifyOTPPending = () => ({
  type: VERIFY_OTP_PENDING,
})

const isResendOTPSuccess = isGetOTPSuccess

const isResendOTPPending = () => ({
  type: RESEND_OTP_PENDING,
})

const isResendOTPError = isVerifyOTPError

const isResendOTPDisabled = (errorMessage) => ({
  type: RESEND_OTP_DISABLED,
  payload: errorMessage,
})

const isLoggedInSuccess = (user) => ({
  type: IS_LOGGED_IN_SUCCESS,
  payload: user,
})
const isLoggedOut = () => ({ type: IS_LOGGED_OUT })

const getEmailValidationGlobExpression = () => (dispatch, getState) => {
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
const getOTPEmail = () => (dispatch, getState) => {
  dispatch(rootActions.closeSnackbar())

  const { login } = getState()
  const { email, formVariant } = login
  let pendingAction
  let successAction
  let errorAction

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
const isLoggedIn = () => (dispatch) =>
  get('/api/login/isLoggedIn').then((response) => {
    const isOk = response.ok
    return response.json().then((json) => {
      if (isOk) {
        const { user } = json
        dispatch(isLoggedInSuccess(user))
      } else {
        const { message } = json
        dispatch(isLoggedOut(message))
      }
    })
  })

/**
 * Called when user enters OTP and submits for verification.
 */
const verifyOTP = () => (dispatch, getState) => {
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

const logout = () => (dispatch) =>
  get('/api/logout').then((response) => {
    if (response.ok) {
      dispatch(isLoggedOut())

      // Clear the shortUrl and longUrl on logout
      dispatch(userActions.resetUserState())
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
