import { MailBody } from '../email'
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
    const { MailerNode } = require('../email')
    const service = new MailerNode()

    it('should not send mail if otp is undefined', async () => {
      const testEmail = 'test@email.com'
      const testOtp = undefined
      const testIp = '1.1.1.1'

      const sendMailSpy = jest.spyOn(service, 'sendMail')
      await service.mailOTP(testEmail, testOtp, testIp)
      expect(sendMailSpy).not.toHaveBeenCalled()
    })

    it('should not send mail if email is undefined', async () => {
      const testEmail = undefined
      const testOtp = '111111'
      const testIp = '1.1.1.1'

      const sendMailSpy = jest.spyOn(service, 'sendMail')
      await service.mailOTP(testEmail, testOtp, testIp)
      expect(sendMailSpy).not.toHaveBeenCalled()
    })
  })
})
