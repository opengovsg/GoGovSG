import validator from 'validator'
import {
  GET_OTP_EMAIL_ERROR,
  GET_OTP_EMAIL_PENDING,
  GET_OTP_EMAIL_SUCCESS,
  IS_LOGGED_IN_SUCCESS,
  IS_LOGGED_OUT,
  LoginActionType,
  RESEND_OTP_DISABLED,
  RESEND_OTP_PENDING,
  SET_EMAIL,
  SET_EMAIL_VALIDATOR,
  SET_OTP,
  VERIFY_OTP_ERROR,
  VERIFY_OTP_PENDING,
} from '../../actions/login/types'
import { loginFormVariants } from '../../util/types'
import { LoginState } from './types'

export const defaultEmailValidator = (email: string) =>
  validator.isEmail(email, { allow_utf8_local_part: false })

const initialState: LoginState = {
  email: '',
  emailValidator: defaultEmailValidator,
  otp: '',
  user: {},
  isLoggedIn: false,
  formVariant: loginFormVariants.types.EMAIL_READY,
}

export const login = (state = initialState, action: LoginActionType) => {
  let nextState = {}

  switch (action.type) {
    case SET_EMAIL:
      nextState = {
        email: action.payload.toLowerCase(), // Force input to be lowercase
      }
      break
    case SET_OTP:
      nextState = {
        otp: action.payload,
      }
      break
    case SET_EMAIL_VALIDATOR:
      nextState = {
        emailValidator: action.payload,
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
        email: action.payload,
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
        user: action.payload,
        formVariant: loginFormVariants.types.EMAIL_READY,
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}
