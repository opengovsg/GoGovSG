/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { StorableOtp } from '../../../../src/server/repositories/types'
import { OtpRepository } from '../../../../src/server/modules/auth/interfaces/OtpRepository'

@injectable()
export class OtpRepositoryMock implements OtpRepository {
  cache = new Map<string, StorableOtp>()

  deleteOtpByEmail = (email: string) => {
    this.cache.delete(email)
    return Promise.resolve()
  }

  setOtpForEmail = (email: string, otp: StorableOtp) => {
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
export class OtpRepositoryMockDown implements OtpRepository {
  deleteOtpByEmail(_: string): Promise<void> {
    return Promise.reject(Error())
  }

  setOtpForEmail(_: string, __: StorableOtp): Promise<void> {
    return Promise.reject(Error())
  }

  getOtpForEmail(_: string): Promise<any> {
    return Promise.reject(Error())
  }
}

export class OtpRepositoryMockNoWrite extends OtpRepositoryMock {
  deleteOtpByEmail = (_: string) => Promise.reject()

  setOtpForEmail = (__: string, _: StorableOtp) => Promise.reject()
}
