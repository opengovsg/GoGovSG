export { LoginController } from './LoginController'
export { LogoutController } from './LogoutController'

export type EmailProperty = {
  email: string
}

type OtpProperty = {
  otp: string
}

export type VerifyOtpRequest = EmailProperty & OtpProperty
