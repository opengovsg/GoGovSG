import { injectable } from 'inversify'
import { otpClient } from '../../redis'
import { otpExpiry } from '../../config'

export interface StoredOtp {
  hashedOtp: string
  retries: number
}
export interface OtpCache {
  deleteOtpByEmail(email: string): Promise<void>

  setOtpForEmail(email: string, otp: StoredOtp): Promise<void>

  getOtpForEmail(email: string): Promise<StoredOtp | null>
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["deleteOtpByEmail", "setOtpForEmail", "getOtpForEmail"] }] */
export class OtpCacheRedis implements OtpCache {
  deleteOtpByEmail(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      otpClient.del(email, (redisDelError, resdisDelResponse) => {
        if (redisDelError || resdisDelResponse !== 1) {
          reject(redisDelError)
          return
        }

        resolve()
      })
    })
  }

  setOtpForEmail(email: string, otp: StoredOtp): Promise<void> {
    return new Promise((resolve, reject) => {
      otpClient.set(
        email,
        JSON.stringify(otp),
        'EX',
        otpExpiry,
        (redisSetError) => {
          if (redisSetError) {
            reject(redisSetError)
            return
          }

          resolve()
        },
      )
    })
  }

  getOtpForEmail(email: string): Promise<StoredOtp | null> {
    return new Promise((resolve, reject) => {
      otpClient.get(email, (redisError, string) => {
        if (redisError) {
          reject(redisError)
          return
        }

        if (!string) {
          resolve(null)
        }

        resolve(JSON.parse(string))
      })
    })
  }
}
