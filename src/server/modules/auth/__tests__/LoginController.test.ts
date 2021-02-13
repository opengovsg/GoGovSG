import httpMocks from 'node-mocks-http'
import {
  createRequestWithEmail,
  createRequestWithEmailAndOtp,
  createRequestWithUser,
  userModelMock,
} from '../../../../../test/server/api/util'
import { logger, saltRounds } from '../../../../../test/server/config'
import { UserRepository } from '../../../repositories/UserRepository'
import { UserMapper } from '../../../mappers/UserMapper'
import { UrlMapper } from '../../../mappers/UrlMapper'

import { AuthService } from '../services'

import { LoginController } from '..'

const loggerErrorSpy = jest.spyOn(logger, 'error')

jest.mock('../../../models/user', () => ({
  User: userModelMock,
}))

function getMockResponse(): any {
  return {
    ok: jest.fn(),
    notFound: jest.fn(),
    send: jest.fn(),
    badRequest: jest.fn(),
    serverError: jest.fn(),
    unauthorized: jest.fn(),
  }
}

/**
 * Integration tests for login middleware. I.e UserRepository is not mocked.
 */
describe('LoginController', () => {
  afterEach(() => {
    loggerErrorSpy.mockClear()
  })
  describe('getIsLoggedIn', () => {
    const authService = { generateOtp: jest.fn(), verifyOtp: jest.fn() }
    const controller = new LoginController(authService)

    test('session contains user', () => {
      const req = createRequestWithUser('fakeUser')
      const res = getMockResponse()

      controller.getIsLoggedIn(req, res)

      expect(res.ok).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'fakeUser' }),
      )
    })

    test('session does not contain user', () => {
      const req = createRequestWithUser(undefined)
      const res = getMockResponse()

      controller.getIsLoggedIn(req, res)

      expect(res.notFound).toHaveBeenCalled()
    })
  })

  describe('getLoginMessage', () => {
    const authService = { generateOtp: jest.fn(), verifyOtp: jest.fn() }
    const controller = new LoginController(authService)

    test('returns login message', () => {
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      controller.getLoginMessage(req, res)

      expect(res.send).toHaveBeenCalledWith('login message')
    })
  })

  describe('getEmailDomains', () => {
    const authService = { generateOtp: jest.fn(), verifyOtp: jest.fn() }
    const controller = new LoginController(authService)

    test('returns domains', () => {
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      controller.getEmailDomains(req, res)

      expect(res.send).toHaveBeenCalledWith('*.test.sg')
    })
  })

  describe('generateOtp', () => {
    const email = 'aa@open.test.sg'
    const otp = '1'
    const ip = '1.1.1.1'

    const hash = jest.fn()
    const compare = jest.fn()

    const mailOTP = jest.fn()
    const initMailer = jest.fn()

    const deleteOtpByEmail = jest.fn()
    const setOtpForEmail = jest.fn()
    const getOtpForEmail = jest.fn()

    const urlMapper = new UrlMapper()
    const authService = new AuthService(
      { hash, compare },
      { mailOTP, initMailer },
      { deleteOtpByEmail, setOtpForEmail, getOtpForEmail },
      new UserRepository(new UserMapper(urlMapper), urlMapper),
    )
    const controller = new LoginController(authService)
    beforeEach(() => {
      hash.mockClear()
      compare.mockClear()
      mailOTP.mockClear()
      initMailer.mockClear()
      deleteOtpByEmail.mockClear()
      setOtpForEmail.mockClear()
      getOtpForEmail.mockClear()

      hash.mockResolvedValue(otp)
    })
    test('valid new email', async () => {
      // TODO - mock getOTP so that we can truly
      // verify that the value is passed through
      const req = createRequestWithEmail(email)
      const res = getMockResponse()

      await controller.generateOtp(req, res)

      expect(hash).toHaveBeenCalledWith(otp, saltRounds)
      expect(mailOTP).toBeCalledWith(email, otp, ip)
      expect(res.ok).toHaveBeenCalled()
      expect(setOtpForEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          hashedOtp: otp,
          retries: expect.any(Number),
        }),
      )
    })
    test('email server down', async () => {
      mailOTP.mockRejectedValue(new Error('Unable to send OTP'))

      const req = createRequestWithEmail(email)
      const res = getMockResponse()

      await controller.generateOtp(req, res)

      expect(mailOTP).toBeCalledWith(email, otp, ip)
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })

    test('otp cache down', async () => {
      setOtpForEmail.mockRejectedValue(new Error('Unable to store OTP'))

      const req = createRequestWithEmail('aa@open.test.sg')
      const res = getMockResponse()

      await controller.generateOtp(req, res)

      expect(mailOTP).not.toHaveBeenCalled()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })
  })

  describe('verifyOtp tests', () => {
    const email = 'aa@open.test.sg'
    const otp = '1'

    const hash = jest.fn()
    const compare = jest.fn()

    const mailOTP = jest.fn()
    const initMailer = jest.fn()

    const deleteOtpByEmail = jest.fn()
    const setOtpForEmail = jest.fn()
    const getOtpForEmail = jest.fn()

    const urlMapper = new UrlMapper()
    const userRepository = new UserRepository(
      new UserMapper(urlMapper),
      urlMapper,
    )

    const findOrCreateWithEmail = jest.spyOn(
      userRepository,
      'findOrCreateWithEmail',
    )

    const authService = new AuthService(
      { hash, compare },
      { mailOTP, initMailer },
      { deleteOtpByEmail, setOtpForEmail, getOtpForEmail },
      userRepository,
    )

    const controller = new LoginController(authService)

    beforeEach(() => {
      hash.mockClear()
      compare.mockClear()
      mailOTP.mockClear()
      initMailer.mockClear()
      deleteOtpByEmail.mockClear()
      setOtpForEmail.mockClear()
      getOtpForEmail.mockClear()
      findOrCreateWithEmail.mockClear()

      compare.mockImplementation((data, encrypted) =>
        Promise.resolve(data === encrypted),
      )
      deleteOtpByEmail.mockResolvedValue(undefined)
    })

    describe('With all services up', () => {
      test('valid email and otp', async () => {
        const user = { id: 1, email }

        getOtpForEmail.mockImplementation((e) =>
          Promise.resolve(
            e === email
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndOtp(email, otp)
        const res = getMockResponse()
        findOrCreateWithEmail.mockResolvedValue(user)

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).toHaveBeenCalledWith(email)
        expect(req.session!.user).toStrictEqual(user)
        expect(res.ok).toHaveBeenCalled()
      })

      test('valid email, wrong otp and expiring', async () => {
        const badOtp = '0'

        getOtpForEmail.mockImplementation((e) =>
          Promise.resolve(
            e === email
              ? {
                  hashedOtp: otp,
                  retries: 1,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndOtp(email, badOtp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).toHaveBeenCalledWith(email)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and no otp in cache', async () => {
        getOtpForEmail.mockResolvedValue(null)

        const req = createRequestWithEmailAndOtp(email, otp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).not.toHaveBeenCalled()
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and wrong otp with retries left', async () => {
        const badOtp = '0'
        getOtpForEmail.mockImplementation((e) =>
          Promise.resolve(
            e === email
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )

        const req = createRequestWithEmailAndOtp(email, badOtp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(setOtpForEmail).toHaveBeenCalledWith(email, {
          hashedOtp: otp,
          retries: 99,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('no email and has valid otp in request', async () => {
        getOtpForEmail.mockImplementation((e) =>
          Promise.resolve(
            e === email
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndOtp(undefined, '1')
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(setOtpForEmail).not.toHaveBeenCalled()
        expect(deleteOtpByEmail).not.toHaveBeenCalled()
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })
    })

    test('cache down', async () => {
      getOtpForEmail.mockRejectedValue(new Error())
      const req = createRequestWithEmailAndOtp(email, otp)
      const res = getMockResponse()

      await controller.verifyOtp(req, res)

      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })

    test('db down', async () => {
      getOtpForEmail.mockImplementation((e) =>
        Promise.resolve(
          e === email
            ? {
                hashedOtp: otp,
                retries: 100,
              }
            : null,
        ),
      )
      findOrCreateWithEmail.mockRejectedValue(new Error())

      const req = createRequestWithEmailAndOtp(email, otp)
      const res = getMockResponse()

      await controller.verifyOtp(req, res)

      expect(setOtpForEmail).not.toHaveBeenCalled()
      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })
  })
})
