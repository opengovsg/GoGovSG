/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { otpClient } from '../../../redis.js'
import { StorableOtp } from '../../../repositories/types.js'
import { otpExpiry } from '../../../config.js'
import * as interfaces from '../interfaces/index.js'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper.js'
import { DependencyIds } from '../../../constants.js'

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

  public deleteOtpByEmail: (email: string, ip: string) => Promise<void> =
    async (email, ip) => {
      const key = this.getRedisKey(email, ip)
      const deletedCount = await otpClient.del(key)
      if (deletedCount !== 1) {
        throw new Error(`Failed to delete OTP for key:\t${key}`)
      }
    }

  public setOtpForEmail: (
    email: string,
    ip: string,
    otp: StorableOtp,
  ) => Promise<void> = async (email, ip, otp) => {
    const key = this.getRedisKey(email, ip)
    await otpClient.setEx(key, otpExpiry, this.otpMapper.dtoToPersistence(otp))
  }

  public getOtpForEmail: (
    email: string,
    ip: string,
  ) => Promise<StorableOtp | null> = async (email, ip) => {
    const key = this.getRedisKey(email, ip)
    const string = await otpClient.get(key)
    if (!string) {
      return null
    }
    return this.otpMapper.persistenceToDto(string)
  }
}

export default OtpRepository
