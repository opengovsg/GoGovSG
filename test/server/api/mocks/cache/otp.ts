/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { OtpCache, StoredOtp } from '../../../../../src/server/api/cache/otp'

@injectable()
export class OtpCacheMock implements OtpCache {
  cache = new Map<string, StoredOtp>()

  deleteOtpByEmail = (email: string) => {
    this.cache.delete(email)
    return Promise.resolve()
  }

  setOtpForEmail = (email: string, otp: StoredOtp) => {
    this.cache.set(email, otp)
    return Promise.resolve()
  }

  getOtpForEmail = (email: string) => {
    if (!this.cache.has(email)) {
      return Promise.resolve(null)
    }
    return Promise.resolve(this.cache.get(email)!)
  }
}

@injectable()
export class OtpCacheMockDown implements OtpCache {
  deleteOtpByEmail(_: string): Promise<void> {
    return Promise.reject(Error())
  }

  setOtpForEmail(_: string, __: StoredOtp): Promise<void> {
    return Promise.reject(Error())
  }

  getOtpForEmail(_: string): Promise<any> {
    return Promise.reject(Error())
  }
}

export class OtpCacheMockNoWrite extends OtpCacheMock {
  deleteOtpByEmail = (_: string) => Promise.reject()

  setOtpForEmail = (__: string, _: StoredOtp) => Promise.reject()
}
