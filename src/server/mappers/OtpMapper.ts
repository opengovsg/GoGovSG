/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { StorableOtp } from '../repositories/types'
import { TwoWayMapper } from './TwoWayMapper'

@injectable()
export class OtpMapper implements TwoWayMapper<StorableOtp, string> {
  persistenceToDto(otp: string): StorableOtp
  persistenceToDto(otp: string | null): StorableOtp | null {
    if (!otp) {
      return null
    }
    return JSON.parse(otp)
  }

  dtoToPersistence(otp: StorableOtp): string
  dtoToPersistence(otp: StorableOtp | null): string | null {
    if (!otp) {
      return null
    }

    return JSON.stringify(otp)
  }
}

export default OtpMapper
