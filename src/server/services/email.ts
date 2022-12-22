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
import {
  BULK_QR_DOWNLOAD_FORMATS,
  BULK_QR_DOWNLOAD_MAPPINGS,
} from '../../shared/constants'

const domainVariantMap = {
  gov: 'go.gov.sg',
  edu: 'for.edu.sg',
  health: 'for.sg',
} as const
const domainVariant = domainVariantMap[assetVariant]

type SenderDomain = typeof domainVariantMap[keyof typeof domainVariantMap]
export interface MailBody {
  to: string
  body: string
  subject: string
  senderDomain?: SenderDomain
}

let transporter: nodemailer.Transport
export interface Mailer {
  initMailer(): void

  /**
   * Sends email to SES / MailDev to send out. Falls back to Postman.
   */
  mailOTP(email: string, otp: string, ip: string): Promise<void>
  mailJobSuccess(email: string, downloadLinks: string[]): Promise<void>
  mailJobFailure(email: string): Promise<void>
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
      throw error
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

  sendMail(mail: MailBody): Promise<void> {
    const mailBody: MailBody = {
      ...mail,
      senderDomain: mail.senderDomain || domainVariant,
    }
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
    }

    return this.sendMail(mailBody)
  }

  mailJobSuccess(email: string, downloadLinks: string[]): Promise<void> {
    if (!email || !downloadLinks) {
      logger.error('Email or download links not specified')
      return Promise.resolve()
    }

    const subject = `[${domainVariant}] QR code generation for your links is successful`
    const body = `Your links have been successfully generated from your csv file.

        <p>Download QR codes for your links (PNG): ${downloadLinks.map(
          (downloadLink) =>
            `<a href="${downloadLink}/${
              BULK_QR_DOWNLOAD_MAPPINGS[BULK_QR_DOWNLOAD_FORMATS.PNG]
            }?x-source=email" target="_blank">here </a>`,
        )}</p>
        <p>Download QR codes for your links (SVG): ${downloadLinks.map(
          (downloadLink) =>
            `<a href="${downloadLink}/${
              BULK_QR_DOWNLOAD_MAPPINGS[BULK_QR_DOWNLOAD_FORMATS.SVG]
            }?x-source=email" target="_blank">here </a>`,
        )}</p>
      `

    const mailBody: MailBody = {
      to: email,
      body,
      subject,
    }
    return this.sendMail(mailBody)
  }

  mailJobFailure(email: string): Promise<void> {
    if (!email) {
      logger.error('Email not specified')
      return Promise.resolve()
    }

    const subject = `[${domainVariant}] QR code generation for your links has failed`
    const body = `Bulk generation of QR codes from your csv file has failed.

        <p>You can still login to <a href="https://${domainVariant}/#/login" target="_blank">${domainVariant}</a> and download the QR codes for your links individually.</p> 
      `

    const mailBody: MailBody = {
      to: email,
      body,
      subject,
    }
    return this.sendMail(mailBody)
  }
}
