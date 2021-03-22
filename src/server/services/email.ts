/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["mailOTP", "initMailer"] }] */

import { injectable } from 'inversify'
import nodemailer from 'nodemailer'
import {
  assetVariant,
  logger,
  ogUrl,
  otpExpiry,
  transporterOptions,
} from '../config'

const domainVariant = assetVariant === 'edu' ? 'for.edu.sg' : 'go.gov.sg'

let transporter: nodemailer.Transport

export interface Mailer {
  initMailer(): void

  /**
   * Sends email to SES / MailDev / Direct transport to send out.
   */
  mailOTP(email: string, otp: string, ip: string): Promise<void>
}

@injectable()
export class MailerNode implements Mailer {
  initMailer() {
    if (transporterOptions !== null) {
      // Uses SES SMTP transport
      transporter = nodemailer.createTransport(transporterOptions)
    } else {
      logger.warn(
        'No SES credentials detected, using MailDev at localhost:1080. This should NEVER be seen in production.',
      )
      // Falls back to maildev
      transporter = nodemailer.createTransport({
        host: 'maildev',
        port: '25',
        ignoreTLS: true,
      })
    }
  }

  mailOTP(email: string, otp: string, ip: string): Promise<void> {
    if (!email || !otp) {
      logger.error('Email or OTP not specified to nodemailer')
      return Promise.resolve()
    }

    const emailHTML = `Your OTP is <b>${otp}</b>. It will expire in ${Math.floor(
      otpExpiry / 60,
    )} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one at ${ogUrl} on the internet.</p>
    <p>This login attempt was made from the IP: ${ip}. If you did not attempt to log in, you may choose to ignore this email or investigate this IP address further.</p>`
    const mail: nodemailer.MailOptions = {
      to: email,
      from: `${domainVariant} <donotreply@mail.${domainVariant}>`,
      subject: `One-Time Password (OTP) for ${domainVariant}`,
      html: emailHTML,
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
}
