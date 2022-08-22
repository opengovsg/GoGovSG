/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["mailOTP", "initMailer", "sendPostmanMail", "sendTransporterMail"] }] */

import { injectable } from 'inversify'
import nodemailer from 'nodemailer'
import fetch from 'cross-fetch'
import assetVariant from '../../shared/util/asset-variant'
import {
  activatePostmanFallback,
  logger,
  ogUrl,
  otpExpiry,
  postmanApiKey,
  postmanApiUrl,
  transporterOptions,
} from '../config'

const domainVariantMap = {
  gov: 'go.gov.sg',
  edu: 'for.edu.sg',
  health: 'for.sg',
}
const domainVariant = domainVariantMap[assetVariant]

interface MailBody {
  to: string
  body: string
  subject: string
  senderDomain?: string
}

let transporter: nodemailer.Transport
export interface Mailer {
  initMailer(): void

  /**
   * Sends email to SES / MailDev to send out.
   */
  mailOTP(email: string, otp: string, ip: string): Promise<void>
}

@injectable()
export class MailerNode implements Mailer {
  public aFetch: any = fetch

  initMailer() {
    transporter = nodemailer.createTransport(transporterOptions)
  }

  async sendPostmanMail(mailBody: MailBody): Promise<void> {
    if (!postmanApiKey || !postmanApiUrl) {
      logger.error('No Postman credentials found')
      throw new Error('Unable to send Postman email')
    }
    const { to, subject, body, senderDomain } = mailBody
    const mail = {
      recipient: to,
      from: `${senderDomain} <donotreply@mail.postman.gov.sg>`,
      subject,
      body,
    }

    const response = await fetch(postmanApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${postmanApiKey}`,
      },
      body: JSON.stringify(mail),
    })
    if (!response.ok) {
      const error = new Error(
        `Failed to send Postman mail:\tError: ${
          response.statusText
        }\thttpResponse: ${response.status}\t body:${JSON.stringify(response)}`,
      )
      logger.error(error.message)
      // TODO: please help to check FE error handling before throwing the exception
      // throw e
    }
    return
  }

  sendTransporterMail(mailBody: MailBody): Promise<void> {
    const { to, subject, body, senderDomain } = mailBody
    const mail: nodemailer.MailOptions = {
      to,
      from: `${senderDomain} <donotreply@mail.${senderDomain}>`,
      subject,
      html: body,
    }
    return new Promise((resolve, reject) => {
      transporter.sendMail(mail, (err) => {
        if (err) {
          logger.error(`Error sending mail:\t${err}`)
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  sendMail(mailBody: MailBody): Promise<void> {
    if (activatePostmanFallback) {
      logger.info(`Sending Postman mail`)
      return this.sendPostmanMail(mailBody)
    }
    logger.info(`Sending SES mail`)
    return this.sendTransporterMail(mailBody)
  }

  mailOTP(email: string, otp: string, ip: string): Promise<void> {
    if (!email || !otp) {
      logger.error('Email or OTP not specified')
      return Promise.resolve()
    }

    const emailHTML = `Your OTP is <b>${otp}</b>. It will expire in ${Math.floor(
      otpExpiry / 60,
    )} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one at ${ogUrl} on the internet.</p>
    <p>This login attempt was made from the IP: ${ip}. If you did not attempt to log in, you may choose to ignore this email or investigate this IP address further.</p>`

    const mailBody: MailBody = {
      to: email,
      subject: `One-Time Password (OTP) for ${domainVariant}`,
      body: emailHTML,
      senderDomain: domainVariant,
    }

    return this.sendMail(mailBody)
  }
}
