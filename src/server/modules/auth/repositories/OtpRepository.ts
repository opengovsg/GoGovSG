/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { otpClient } from '../../../redis'
import { StorableOtp } from '../../../repositories/types'
import { otpExpiry } from '../../../config'
import * as interfaces from '../interfaces'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper'
import { DependencyIds } from '../../../constants'

@injectable()
export class OtpRepository implements interfaces.OtpRepository {
  private otpMapper: TwoWayMapper<StorableOtp, string>

  public constructor(
    @inject(DependencyIds.otpMapper)
    otpMapper: TwoWayMapper<StorableOtp, string>,
  ) {
    this.otpMapper = otpMapper
  }

  private getRedisKey(email: string, ip: string): string {
    return `${email}:${ip}`
  }

  public deleteOtpByEmail: (email: string, ip: string) => Promise<void> = (
    email,
    ip,
  ) => {
    return new Promise((resolve, reject) => {
      const key = this.getRedisKey(email, ip)
      otpClient.del(key, (redisDelError, resdisDelResponse) => {
        if (redisDelError || resdisDelResponse !== 1) {
          reject(redisDelError)
          return
        }

        resolve()
      })
    })
  }

  public setOtpForEmail: (
    email: string,
    ip: string,
    otp: StorableOtp,
  ) => Promise<void> = (email, ip, otp) => {
    return new Promise((resolve, reject) => {
      const key = this.getRedisKey(email, ip)
      otpClient.set(
        key,
        this.otpMapper.dtoToPersistence(otp),
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

  public getOtpForEmail: (
    email: string,
    ip: string,
  ) => Promise<StorableOtp | null> = (email, ip) => {
    return new Promise((resolve, reject) => {
      const key = this.getRedisKey(email, ip)
      otpClient.get(key, (redisError, string) => {
        if (redisError) {
          reject(redisError)
          return
        }

        if (!string) {
          resolve(null)
        }

        resolve(this.otpMapper.persistenceToDto(string))
      })
    })
  }
}

export default OtpRepository
