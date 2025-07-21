import { StorableOtp } from '../../../repositories/types'

export interface OtpRepository {
  /**
   * Get the redis key for the otp associated with the user with the input email and IP.
   * @param  {string} email Email of the user.
   * @param  {string} ip IP address of the user.
   * @returns Promise that resolves to the redis key.
   */
  getRedisKey(email: string, ip: string): string

  /**
   * Delete the otp associated with the user with the input email and IP.
   * @param  {string} email Email of the user.
   * @param  {string} ip IP address of the user.
   * @returns Promise that resolves to void.
   */
  deleteOtpByEmail(email: string, ip: string): Promise<void>

  /**
   * Sets or replaces the otp associated with the user with the input email and IP.
   * @param  {string} email Email of the user.
   * @param  {string} ip IP address of the user.
   * @param  {StorableOtp} otp The new otp to be associated.
   * @returns Promise that resolves to void.
   */
  setOtpForEmail(email: string, ip: string, otp: StorableOtp): Promise<void>

  /**
   * Retrieves the otp associated with the user with the input email and IP.
   * @param  {string} email Email of the user.
   * @param  {string} ip IP address of the user.
   * @returns Promise that resolves the otp or null if it does not exist.
   */
  getOtpForEmail(email: string, ip: string): Promise<StorableOtp | null>
}
