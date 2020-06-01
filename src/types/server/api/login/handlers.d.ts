export type EmailProperty = {
  email: string
}

type OtpProperty = {
  otp: string
}

export type VerifyOtpRequest = EmailProperty & OtpProperty
