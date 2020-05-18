/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["mailOTP", "initMailer"] }] */
import { injectable } from 'inversify'
import { Mailer } from './email'
import { logger } from '../config'

@injectable()
export class MailerNoOp implements Mailer {
  initMailer(): void {}

  mailOTP(_: string, __: string): Promise<void> {
    logger.warn('Allowing user to OTP regardless of input.')
    logger.warn('This message should NEVER be seen in production.')

    return Promise.resolve()
  }
}

export default MailerNoOp
