/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { StorableOtp } from '../../../../src/server/repositories/types'
import { OtpRepository } from '../../../../src/server/modules/auth/interfaces/OtpRepository'

@injectable()
export class OtpRepositoryMock implements OtpRepository {
  cache = new Map<string, StorableOtp>()

  private getCacheKey(email: string, ip: string): string {
    return `${email}:${ip}`
  }

  getRedisKey(email: string, ip: string): string {
    return this.getCacheKey(email, ip)
  }

  deleteOtpByEmail = (email: string, ip: string) => {
    const key = this.getCacheKey(email, ip)
    this.cache.delete(key)
    return Promise.resolve()
  }

  setOtpForEmail = (email: string, ip: string, otp: StorableOtp) => {
    const key = this.getCacheKey(email, ip)
    this.cache.set(key, otp)
    return Promise.resolve()
  }

  getOtpForEmail = (email: string, ip: string) => {
    const key = this.getCacheKey(email, ip)
    if (!this.cache.has(key)) {
      return Promise.resolve(null)
    }
    return Promise.resolve(this.cache.get(key)!)
  }
}

@injectable()
export class OtpRepositoryMockDown implements OtpRepository {
  getRedisKey(email: string, ip: string): string {
    return `${email}:${ip}`
  }

  deleteOtpByEmail(_: string, __: string): Promise<void> {
    return Promise.reject(Error())
  }

  setOtpForEmail(_: string, __: string, ___: StorableOtp): Promise<void> {
    return Promise.reject(Error())
  }

  getOtpForEmail(_: string, __: string): Promise<any> {
    return Promise.reject(Error())
  }
}

export class OtpRepositoryMockNoWrite extends OtpRepositoryMock {
  deleteOtpByEmail = (_: string, __: string) => Promise.reject()

  setOtpForEmail = (_: string, __: string, ___: StorableOtp) => Promise.reject()
}
