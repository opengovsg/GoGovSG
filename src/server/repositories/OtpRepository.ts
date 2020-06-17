/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { otpClient } from '../redis'
import { StorableOtp } from './types'
import { otpExpiry } from '../config'
import { OtpRepositoryInterface } from './interfaces/OtpRepositoryInterface'
import { TwoWayMapper } from '../mappers/TwoWayMapper'
import { DependencyIds } from '../constants'

@injectable()
export class OtpRepository implements OtpRepositoryInterface {
  private otpMapper: TwoWayMapper<StorableOtp, string>

  public constructor(
    @inject(DependencyIds.otpMapper)
    otpMapper: TwoWayMapper<StorableOtp, string>,
  ) {
    this.otpMapper = otpMapper
  }

  public deleteOtpByEmail: (email: string) => Promise<void> = (email) => {
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

  public setOtpForEmail: (email: string, otp: StorableOtp) => Promise<void> = (
    email,
    otp,
  ) => {
    return new Promise((resolve, reject) => {
      otpClient.set(
        email,
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

  public getOtpForEmail: (email: string) => Promise<StorableOtp | null> = (
    email,
  ) => {
    return new Promise((resolve, reject) => {
      otpClient.get(email, (redisError, string) => {
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
