/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { NotFoundError } from '../../../../../src/server/util/error'
import { OtpCache } from '../../../../../src/server/api/cache/otp'

@injectable()
export class OtpCacheMockFilled implements OtpCache {
  cache = new Map<string, object>()

  deleteOtpByEmail(email: string): Promise<void> {
    this.cache.delete(email)
    return Promise.resolve()
  }

  setOtpForEmail(email: string, otp: object): Promise<void> {
    this.cache.set(email, otp)
    return Promise.resolve()
  }

  getOtpForEmail(email: string): Promise<any> {
    return Promise.resolve(this.cache.get(email))
  }
}

@injectable()
export class OtpCacheMock implements OtpCache {
  cache = new Map<string, object>()

  deleteOtpByEmail(email: string): Promise<void> {
    this.cache.delete(email)
    return Promise.resolve()
  }

  setOtpForEmail(email: string, otp: object): Promise<void> {
    this.cache.set(email, otp)
    return Promise.resolve()
  }

  getOtpForEmail(email: string): Promise<any> {
    if (!this.cache.has(email)) {
      return Promise.reject(new NotFoundError(''))
    }
    return Promise.resolve(this.cache.get(email))
  }
}

export class OtpCacheMockDown implements OtpCache {
  deleteOtpByEmail(_: string): Promise<void> {
    return Promise.reject(Error())
  }

  setOtpForEmail(_: string, __: object): Promise<void> {
    return Promise.reject(Error())
  }

  getOtpForEmail(_: string): Promise<any> {
    return Promise.reject(Error())
  }
}

export class OtpCacheMockNoWrite extends OtpCacheMock {
  setOtpForEmail(_: string, __: object): Promise<void> {
    return Promise.reject(Error())
  }

  deleteOtpByEmail(_: string): Promise<void> {
    return Promise.reject(Error())
  }
}
