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

export const defaultEmailValidationGlobExpression = new Minimatch('*')

const initialState = {
  email: '',
  emailValidator: defaultEmailValidationGlobExpression,
  otp: '',
  user: {},
  isLoggedIn: false,
  formVariant: loginFormVariants.types.EMAIL_READY,
  location: {},
}

export const login = (state = initialState, action) => {
  let nextState = {}
  const { payload } = action

  switch (action.type) {
    case SET_EMAIL:
      nextState = {
        email: payload.toLowerCase(), // Force input to be lowercase
      }
      break
    case SET_OTP:
      nextState = {
        otp: payload,
      }
      break
    case SET_EMAIL_VALIDATOR:
      nextState = {
        emailValidator: payload,
      }
      break
    case GET_OTP_EMAIL_ERROR:
      nextState = {
        formVariant: loginFormVariants.types.EMAIL_READY,
      }
      break
    case GET_OTP_EMAIL_PENDING:
      nextState = {
        formVariant: loginFormVariants.types.EMAIL_PENDING,
      }
      break
    case GET_OTP_EMAIL_SUCCESS:
      nextState = {
        formVariant: loginFormVariants.types.OTP_READY,
        email: payload,
      }
      break
    case VERIFY_OTP_ERROR:
      nextState = {
        formVariant: loginFormVariants.types.OTP_READY,
        isLoggedIn: false,
      }
      break
    case VERIFY_OTP_PENDING:
      nextState = {
        formVariant: loginFormVariants.types.OTP_PENDING,
        isLoggedIn: false,
      }
      break
    case RESEND_OTP_PENDING:
      nextState = {
        formVariant: loginFormVariants.types.OTP_PENDING,
      }
      break
    case RESEND_OTP_DISABLED:
      nextState = {
        formVariant: loginFormVariants.types.RESEND_OTP_DISABLED,
      }
      break
    case IS_LOGGED_OUT:
      nextState = {
        formVariant: loginFormVariants.types.EMAIL_READY,
        isLoggedIn: false,
        user: {},
      }
      break
    case IS_LOGGED_IN_SUCCESS:
      nextState = {
        isLoggedIn: true,
        user: payload,
        formVariant: loginFormVariants.types.EMAIL_READY,
      }
      break
    default:
      return state
  }
  return Object.assign({}, state, nextState)
}
