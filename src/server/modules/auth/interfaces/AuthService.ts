import { StorableUser } from '../../../repositories/types'

export interface AuthService {
  /**
   * Generates and stores a random otp for the input email.
   * @param  {string} email The email of the user to generate an otp for.
   * @returns Promise that resolves to void.
   */
  generateOtp(email: string, ip: string): Promise<void>

  /**
   * Verifies that the input otp matches the stored otp for the input email.
   * Throws an error if the otp is different or there is no otp generated
   * for the input email.
   * @param  {string} email Email of the user.
   * @param  {string} otp Otp to verify.
   * @returns Promise that resolves to the user if the otp is valid.
   */
  verifyOtp(email: string, otp: string): Promise<StorableUser>

  /**
   * Generates the user with the officer email provided, if the
   * user with the specified officer email does not exist then we
   * create a new user for the input email.
   * @param  {string} email Email of the user.
   * @returns Promise that creates or find the existing user.
   */
  genDBUserWithOfficerEmail(email: string): Promise<StorableUser>
}
