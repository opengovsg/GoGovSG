import { StorableUser } from '../../repositories/types'

export interface AuthServiceInterface {
  generateOtp(email: string): Promise<void>
  verifyOtp(email: string, otp: string): Promise<StorableUser>
}
