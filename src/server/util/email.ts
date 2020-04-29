import nodemailer from 'nodemailer'
import { logger, otpExpiry, transporterOptions } from '../config'

const directTransport = require('nodemailer-direct-transport')

let transporter: nodemailer.Transport

export const initMailer = () => {
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

/**
 * Sends email to SES / Direct transport to send out.
 */
export const mailOTP = (email: string, otp: string, callback: (err: Error) => void) => {
  if (!email || !otp) {
    logger.error('Email or OTP not specified to nodemailer')
    return
  }

  const emailHTML = `Your OTP is <b>${otp}</b>. It will expire in ${Math.floor(otpExpiry / 60)} minutes. 
  Please use this to login to your go.gov.sg account. <p>If your OTP does not work, please request for a new OTP.</p>`
  const mail: nodemailer.MailOptions = {
    to: email,
    from: 'go.gov.sg <donotreply@mail.go.gov.sg>',
    subject: 'One-Time Password (OTP) for go.gov.sg',
    html: emailHTML,
  }

  transporter.sendMail(mail, (err) => {
    if (err) {
      logger.error(`Error sending mail:\t${err}`)
    }

    if (callback) {
      callback(err)
    }
  })
}
