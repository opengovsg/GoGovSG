import { MailBody } from '../email'
import {
  BULK_QR_DOWNLOAD_FORMATS,
  BULK_QR_DOWNLOAD_MAPPINGS,
} from '../../../shared/constants'

/* eslint-disable global-require */

/**
 * Unit tests for Mailer.
 */
describe('Mailer tests', () => {
  const testMailBody = {
    to: 'alexis@open.gov.sg',
    body: 'Hi',
    subject: 'Hi from postman',
    senderDomain: 'go.gov.sg',
  } as MailBody

  const mockFetch = jest.fn()

  beforeEach(() => {
    jest.resetModules()
    mockFetch.mockReset()
  })

  afterAll(jest.resetModules)

  describe('sendPostmanMail', () => {
    it('should throw error if postman api key is undefined', async () => {
      jest.mock('../../config', () => ({
        logger: console,
        postmanApiKey: '',
      }))
      const { MailerNode } = require('../email')
      const service = new MailerNode()

      await expect(service.sendPostmanMail(testMailBody)).rejects.toThrowError()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error if postman api url is undefined', async () => {
      jest.mock('../../config', () => ({
        logger: console,
        postmanApiUrl: '',
        postmanApiKey: 'hey',
      }))
      const { MailerNode } = require('../email')
      const service = new MailerNode()

      await expect(service.sendPostmanMail(testMailBody)).rejects.toThrowError()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error if postman fails to send mail', async () => {
      jest.mock('cross-fetch', () => mockFetch)
      jest.mock('../../config', () => ({
        logger: console,
        postmanApiKey: 'key',
        postmanApiUrl: 'url',
      }))
      const { MailerNode } = require('../email')
      const service = new MailerNode()

      mockFetch.mockResolvedValue({ ok: false })

      await expect(service.sendPostmanMail(testMailBody)).rejects.toThrowError()
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('sendTransporterMail', () => {
    it('should throw error if transporter fails to send mail', async () => {
      const sendMailMock = jest.fn((_, callback) => {
        const err = new Error('error')
        callback(err, null)
      })
      jest.mock('nodemailer', () => ({
        createTransport: jest.fn().mockImplementation(() => ({
          sendMail: sendMailMock,
        })),
      }))

      const { MailerNode } = require('../email')
      const service = new MailerNode()
      service.initMailer()
      await expect(
        service.sendTransporterMail(testMailBody),
      ).rejects.toThrowError()
      expect(sendMailMock).toHaveBeenCalled()
    })
  })

  describe('sendMail', () => {
    it('should send via nodemailer by default', async () => {
      const sendMailMock = jest.fn((_, callback) => callback())
      jest.mock('nodemailer', () => ({
        createTransport: jest.fn().mockImplementation(() => ({
          sendMail: sendMailMock,
        })),
      }))

      const { MailerNode } = require('../email')
      const service = new MailerNode()
      service.initMailer()
      await service.sendMail(testMailBody)
      expect(sendMailMock).toHaveBeenCalled()
    })

    it('should send via Postman if activatePostmanFallback is true', async () => {
      jest.mock('cross-fetch', () => mockFetch)
      jest.mock('../../config', () => ({
        logger: console,
        activatePostmanFallback: true,
        postmanApiKey: 'key',
        postmanApiUrl: 'url',
      }))
      const { MailerNode } = require('../email')
      const service = new MailerNode()

      const postmanSpy = jest.spyOn(service, 'sendPostmanMail')
      mockFetch.mockResolvedValue({ ok: true })

      await service.sendMail(testMailBody)
      expect(postmanSpy).toHaveBeenCalledWith(testMailBody)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('mailOTP', () => {
    const ogUrl = 'gogo.sg'
    const otpExpiry = 300
    const domainVariant = 'go.gov.sg'

    jest.mock('../../config', () => ({
      ogUrl,
      otpExpiry,
      logger: console,
    }))
    const { MailerNode } = require('../email')
    const service = new MailerNode()
    const sendMailSpy = jest.spyOn(service, 'sendMail').mockImplementation()

    beforeEach(() => {
      sendMailSpy.mockClear()
    })

    it('should not send mail if otp is undefined', async () => {
      const testEmail = 'test@email.com'
      const testOtp = undefined
      const testIp = '1.1.1.1'

      await service.mailOTP(testEmail, testOtp, testIp)
      expect(sendMailSpy).not.toHaveBeenCalled()
    })

    it('should not send mail if email is undefined', async () => {
      const testEmail = undefined
      const testOtp = '111111'
      const testIp = '1.1.1.1'

      await service.mailOTP(testEmail, testOtp, testIp)
      expect(sendMailSpy).not.toHaveBeenCalled()
    })

    it('should send an email with the OTP and IP address', async () => {
      const testEmail = 'user@example.com'
      const testOtp = '111111'
      const testIp = '1.1.1.1'

      const expectedBody = `Your OTP is <b>111111</b>. It will expire in ${Math.floor(
        otpExpiry / 60,
      )} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one at ${ogUrl} on the internet.</p>
    <p>This login attempt was made from the IP: 1.1.1.1. If you did not attempt to log in, you may choose to ignore this email or investigate this IP address further.</p>`

      await service.mailOTP(testEmail, testOtp, testIp)
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: `One-Time Password (OTP) for ${domainVariant}`,
        body: expectedBody,
      })
    })
  })

  describe('mailJobSuccess', () => {
    const { MailerNode } = require('../email')
    const service = new MailerNode()
    const sendMailSpy = jest.spyOn(service, 'sendMail').mockImplementation()
    const domainVariant = 'go.gov.sg'

    beforeEach(() => {
      sendMailSpy.mockClear()
    })

    it('should not send mail if email is undefined', async () => {
      // Email not specified
      await service.mailJobSuccess(null, ['downloadLink1', 'downloadLink2'])
      expect(sendMailSpy).not.toBeCalled()
    })

    it('should not send mail if download links is undefined', async () => {
      // Download links not specified
      await service.mailJobSuccess('test@email.com', null)
      expect(sendMailSpy).not.toBeCalled()
    })

    it('should call sendMail with the correct email body if email and downloadLinks are specified', async () => {
      const downloadLinks = ['downloadLink1', 'downloadLink2']

      const expectedSubject = `[${domainVariant}] QR code generation for your links is successful`
      const expectedBody = `Your links have been successfully generated from your csv file.

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

      await service.mailJobSuccess('test@email.com', downloadLinks)
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'test@email.com',
        body: expectedBody,
        subject: expectedSubject,
      })
    })
  })

  describe('mailJobFailure', () => {
    const { MailerNode } = require('../email')
    const service = new MailerNode()
    const sendMailSpy = jest.spyOn(service, 'sendMail').mockImplementation()
    const domainVariant = 'go.gov.sg'

    beforeEach(() => {
      sendMailSpy.mockClear()
    })

    it('should not send mail if email is undefined', async () => {
      // Email not specified
      await service.mailJobFailure(null)
      expect(sendMailSpy).not.toBeCalled()
    })

    it('should call sendMail with the correct email body if email is specified', async () => {
      const expectedSubject = `[${domainVariant}] QR code generation for your links has failed`
      const expectedBody = `Bulk generation of QR codes from your csv file has failed.

        <p>You can still login to <a href="https://${domainVariant}/#/login" target="_blank">${domainVariant}</a> and download the QR codes for your links individually.</p> 
      `

      await service.mailJobFailure('test@email.com')
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'test@email.com',
        body: expectedBody,
        subject: expectedSubject,
      })
    })
  })
})
