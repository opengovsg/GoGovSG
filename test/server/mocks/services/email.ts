/* eslint-disable max-classes-per-file, class-methods-use-this */

import { injectable } from 'inversify'
import { Mailer } from '../../../../src/server/services/email'

@injectable()
export class MailerMock implements Mailer {
  mailsSent: any[] = []

  initMailer() {}

  mailOTP = (email: string, otp: string): Promise<void> => {
    this.mailsSent.push({ email, otp })
    return Promise.resolve()
  }

  mailJobSuccess(email: string, downloadLinks: string[]): Promise<void> {
    this.mailsSent.push({ email, downloadLinks })
    return Promise.resolve()
  }

  mailJobFailure(email: string): Promise<void> {
    this.mailsSent.push({ email })
    return Promise.resolve()
  }
}

@injectable()
export class MailerMockDown implements Mailer {
  initMailer() {}

  mailOTP(_: string, __: string): Promise<void> {
    return Promise.reject(Error('Unable to send OTP'))
  }

  mailJobSuccess(_: string, __: string[]): Promise<void> {
    return Promise.reject()
  }

  mailJobFailure(_: string): Promise<void> {
    return Promise.reject()
  }
}
