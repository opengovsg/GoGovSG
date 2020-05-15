import { injectable } from 'inversify'
import { otpClient } from '../../redis'
import { otpExpiry } from '../../config'

export interface OtpCache {
  deleteOtpByEmail(email: string): Promise<void>

  setOtpForEmail(email: string, otp: object): Promise<void>

  getOtpForEmail(email: string): Promise<any>
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

  setOtpForEmail(email: string, otp: object): Promise<void> {
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

  getOtpForEmail(email: string): Promise<any> {
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
