import { Mailer } from './email'
import { injectable } from 'inversify'
import { logger } from '../config'

@injectable()
export class MailerNoOp implements Mailer {
  initMailer(): void {}

  mailOTP(_: string, __: string): Promise<void> {
    logger.warn('Allowing user to OTP even though mail errored.')
    logger.warn(
      'This may be an issue with your IP. More information can be found at https://support.google.com/mail/answer/10336?hl=en)',
    )
    logger.warn('This message should NEVER be seen in production.')

    return Promise.resolve()
  }
}
