import { StorableOtp } from '../types'

export interface OtpRepositoryInterface {
  deleteOtpByEmail(email: string): Promise<void>

  setOtpForEmail(email: string, otp: StorableOtp): Promise<void>

  getOtpForEmail(email: string): Promise<StorableOtp | null>
}
