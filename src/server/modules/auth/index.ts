export { LoginController } from './LoginController.js'
export { LogoutController } from './LogoutController.js'
export { OneGovSgController } from './OneGovSgController.js'

export type EmailProperty = {
  email: string
}

type OtpProperty = {
  otp: string
}

export type VerifyOtpRequest = EmailProperty & OtpProperty
