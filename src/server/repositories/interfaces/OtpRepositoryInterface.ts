import { StorableOtp } from '../types'

export interface OtpRepositoryInterface {
  /**
   * Delete the otp associated with the user with the input email.
   * @param  {string} email Email of the user.
   * @returns Promise that resolves to void.
   */
  deleteOtpByEmail(email: string): Promise<void>

  /**
   * Sets or replaces the otp associated with the user with the input email.
   * @param  {string} email Email of the user.
   * @param  {StorableOtp} otp The new otp to be associated.
   * @returns Promise that resolves to void.
   */
  setOtpForEmail(email: string, otp: StorableOtp): Promise<void>

  /**
   * Retrieves the otp associated with the user with the input email.
   * @param  {string} email Email of the user.
   * @returns Promise that resolves the otp or null if it does not exist.
   */
  getOtpForEmail(email: string): Promise<StorableOtp | null>
}
