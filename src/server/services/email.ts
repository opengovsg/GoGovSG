/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["mailOTP", "initMailer"] }] */

import { injectable } from 'inversify'
import nodemailer from 'nodemailer'
import { logger, otpExpiry, transporterOptions } from '../config'

const directTransport = require('nodemailer-direct-transport')

let transporter: nodemailer.Transport

export interface Mailer {
  initMailer(): void

  /**
   * Sends email to SES / Direct transport to send out.
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
        'No SES credentials detected, Using Nodemailer Direct Transport. This should NEVER be seen in production.',
      )
      // Falls back to direct transport
      transporter = nodemailer.createTransport(directTransport())
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
    Please use this to login to your GoGovSG account.
    <p>If your OTP does not work, please request for a new OTP at https://go.gov.sg on the internet.</p>
    <p>If you did not make this request, you may ignore this email.</p>
    <p>This login attempt was made from the IP: ${ip}. If you did not attempt to log in to GoGovSG, you may choose to investigate this IP address further.</p>`
    const mail: nodemailer.MailOptions = {
      to: email,
      from: 'go.gov.sg <donotreply@mail.go.gov.sg>',
      subject: 'One-Time Password (OTP) for go.gov.sg',
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
