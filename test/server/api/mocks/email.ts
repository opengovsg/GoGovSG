/* eslint-disable max-classes-per-file, class-methods-use-this */

import { injectable } from 'inversify'
import { Mailer } from '../../../../src/server/services/email'

@injectable()
export class MailerMock implements Mailer {
  mailsSent: { email: string; otp: string }[] = []

  initMailer() {}

  mailOTP = (email: string, otp: string): Promise<void> => {
    this.mailsSent.push({ email, otp })
    return Promise.resolve()
  }
}

@injectable()
export class MailerMockDown implements Mailer {
  initMailer() {}

  mailOTP(_: string, __: string): Promise<void> {
    return Promise.reject(Error('Unable to send OTP'))
  }
}
