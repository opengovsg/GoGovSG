import httpMocks from 'node-mocks-http'
import {
  createRequestWithEmail,
  createRequestWithEmailAndIpAndOtp,
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
    const authService = {
      generateOtp: jest.fn(),
      verifyOtp: jest.fn(),
      genDBUserWithOfficerEmail: jest.fn(),
    }
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
    const authService = {
      generateOtp: jest.fn(),
      verifyOtp: jest.fn(),
      genDBUserWithOfficerEmail: jest.fn(),
    }
    const controller = new LoginController(authService)

    test('returns login message', () => {
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      controller.getLoginMessage(req, res)

      expect(res.send).toHaveBeenCalledWith('login message')
    })
  })

  describe('getEmailDomains', () => {
    const authService = {
      generateOtp: jest.fn(),
      verifyOtp: jest.fn(),
      genDBUserWithOfficerEmail: jest.fn(),
    }
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
    const mailJobFailure = jest.fn()
    const mailJobSuccess = jest.fn()

    const deleteOtpByEmail = jest.fn()
    const setOtpForEmail = jest.fn()
    const getOtpForEmail = jest.fn()

    const urlMapper = new UrlMapper()
    const authService = new AuthService(
      { hash, compare },
      { mailOTP, initMailer, mailJobFailure, mailJobSuccess },
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
        ip,
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
    const ip = '1.1.1.1' // This should match the IP set in createRequestWithEmailAndIpAndOtp

    const hash = jest.fn()
    const compare = jest.fn()

    const mailOTP = jest.fn()
    const initMailer = jest.fn()
    const mailJobFailure = jest.fn()
    const mailJobSuccess = jest.fn()

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
      { mailOTP, initMailer, mailJobFailure, mailJobSuccess },
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

        getOtpForEmail.mockImplementation((e, i) =>
          Promise.resolve(
            e === email && i === ip
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndIpAndOtp(email, ip, otp)
        const res = getMockResponse()
        findOrCreateWithEmail.mockResolvedValue(user)

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip)
        expect(req.session!.user).toStrictEqual(user)
        expect(res.ok).toHaveBeenCalled()
      })

      test('valid email, wrong otp and expiring', async () => {
        const badOtp = '0'

        getOtpForEmail.mockImplementation((e, i) =>
          Promise.resolve(
            e === email && i === ip
              ? {
                  hashedOtp: otp,
                  retries: 1,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndIpAndOtp(email, ip, badOtp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and no otp in cache', async () => {
        getOtpForEmail.mockResolvedValue(null)

        const req = createRequestWithEmailAndIpAndOtp(email, ip, otp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(deleteOtpByEmail).not.toHaveBeenCalled()
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and wrong otp with retries left', async () => {
        const badOtp = '0'
        getOtpForEmail.mockImplementation((e, i) =>
          Promise.resolve(
            e === email && i === ip
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )

        const req = createRequestWithEmailAndIpAndOtp(email, ip, badOtp)
        const res = getMockResponse()

        await controller.verifyOtp(req, res)

        expect(setOtpForEmail).toHaveBeenCalledWith(email, ip, {
          hashedOtp: otp,
          retries: 99,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('no email and has valid otp in request', async () => {
        getOtpForEmail.mockImplementation((e, i) =>
          Promise.resolve(
            e === email && i === ip
              ? {
                  hashedOtp: otp,
                  retries: 100,
                }
              : null,
          ),
        )
        const req = createRequestWithEmailAndIpAndOtp(undefined, ip, otp)
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
      const req = createRequestWithEmailAndIpAndOtp(email, ip, otp)
      const res = getMockResponse()

      await controller.verifyOtp(req, res)

      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })

    test('db down', async () => {
      getOtpForEmail.mockImplementation((e, i) =>
        Promise.resolve(
          e === email && i === ip
            ? {
                hashedOtp: otp,
                retries: 100,
              }
            : null,
        ),
      )
      findOrCreateWithEmail.mockRejectedValue(new Error())

      const req = createRequestWithEmailAndIpAndOtp(email, ip, otp)
      const res = getMockResponse()

      await controller.verifyOtp(req, res)

      expect(setOtpForEmail).not.toHaveBeenCalled()
      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })
  })

  // Ensure no active denial of service attacks can be performed on an email address
  // by requesting OTPs for the same email address from different IPs
  describe('OTP IP-based Storage Tests', () => {
    const email = 'test@open.gov.sg'
    const otpA = '123456'
    const otpB = '654321'
    const ip1 = '192.168.1.1'
    const ip2 = '192.168.1.2'

    const hash = jest.fn()
    const compare = jest.fn()
    const mailOTP = jest.fn()
    const initMailer = jest.fn()
    const mailJobFailure = jest.fn()
    const mailJobSuccess = jest.fn()
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
      { mailOTP, initMailer, mailJobFailure, mailJobSuccess },
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
      hash.mockResolvedValue('hashedOtp')
    })

    // For cases where a user has multiple devices, we want to ensure that they can login from any of them
    // This is more of a basic test to ensure that OTP is also dependent on the IP and not just the email address
    test('Same user from different IPs can both complete login successfully', async () => {
      const user = { id: 1, email }
      findOrCreateWithEmail.mockResolvedValue(user)

      // Set up OTPs for both IPs
      getOtpForEmail.mockImplementation((e, i) => {
        if (e === email && i === ip1) {
          return Promise.resolve({ hashedOtp: otpA, retries: 3 })
        }
        if (e === email && i === ip2) {
          return Promise.resolve({ hashedOtp: otpB, retries: 3 })
        }
        return Promise.resolve(null)
      })

      // User logs in from mobile (IP1)
      const req1 = createRequestWithEmailAndIpAndOtp(email, ip1, otpA)
      const res1 = getMockResponse()
      await controller.verifyOtp(req1, res1)

      // User logs in from desktop (IP2)
      const req2 = createRequestWithEmailAndIpAndOtp(email, ip2, otpB)
      const res2 = getMockResponse()
      await controller.verifyOtp(req2, res2)

      // Both should succeed
      expect(res1.ok).toHaveBeenCalled()
      expect(res2.ok).toHaveBeenCalled()
      expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip1)
      expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip2)
    })

    test('User A cannot verify with User B OTP', async () => {
      // Set up OTPs for both users with different values
      getOtpForEmail.mockImplementation((e, i) => {
        if (e === email && i === ip1) {
          return Promise.resolve({ hashedOtp: otpA, retries: 3 })
        }
        if (e === email && i === ip2) {
          return Promise.resolve({ hashedOtp: otpB, retries: 3 })
        }
        return Promise.resolve(null)
      })

      // User A tries to verify with User B's OTP
      const req = createRequestWithEmailAndIpAndOtp(email, ip1, otpB)
      const res = getMockResponse()
      await controller.verifyOtp(req, res)

      // Should fail
      expect(res.unauthorized).toHaveBeenCalled()
      expect(deleteOtpByEmail).not.toHaveBeenCalled()
    })

    // Note: we use the same OTP to ensure OTP deletion is not dependent on the OTP value
    test('Only User A OTP is deleted after successful verification, User B OTP remains', async () => {
      const user = { id: 1, email }
      findOrCreateWithEmail.mockResolvedValue(user)

      // Set up OTPs for both users
      getOtpForEmail.mockImplementation((e, i) => {
        if (e === email && i === ip1) {
          return Promise.resolve({ hashedOtp: otpA, retries: 3 })
        }
        if (e === email && i === ip2) {
          return Promise.resolve({ hashedOtp: otpA, retries: 3 })
        }
        return Promise.resolve(null)
      })

      // User A verifies OTP successfully
      const req = createRequestWithEmailAndIpAndOtp(email, ip1, otpA)
      const res = getMockResponse()
      await controller.verifyOtp(req, res)

      // Only User A's OTP should be deleted
      expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip1)
      expect(deleteOtpByEmail).not.toHaveBeenCalledWith(email, ip2)
      expect(deleteOtpByEmail).toHaveBeenCalledTimes(1)
    })

    test('Different IPs create different Redis keys for same email', async () => {
      // User A requests OTP
      const req1 = createRequestWithEmail(email)
      req1.ip = ip1
      const res1 = getMockResponse()
      await controller.generateOtp(req1, res1)

      // User B requests OTP
      const req2 = createRequestWithEmail(email)
      req2.ip = ip2
      const res2 = getMockResponse()
      await controller.generateOtp(req2, res2)

      // Verify different keys were used
      expect(setOtpForEmail).toHaveBeenCalledWith(
        email,
        ip1,
        expect.any(Object),
      )
      expect(setOtpForEmail).toHaveBeenCalledWith(
        email,
        ip2,
        expect.any(Object),
      )
      expect(setOtpForEmail).toHaveBeenCalledTimes(2)
    })

    test('User A locked out after 3 wrong attempts, User B can still try', async () => {
      compare.mockResolvedValue(false) // Wrong OTP

      // Set up OTPs for both users with mutable retry counts
      let userARetries = 3
      let userBRetries = 3

      getOtpForEmail.mockImplementation((e, i) => {
        if (e === email && i === ip1) {
          return Promise.resolve({ hashedOtp: otpA, retries: userARetries })
        }
        if (e === email && i === ip2) {
          return Promise.resolve({ hashedOtp: otpA, retries: userBRetries })
        }
        return Promise.resolve(null)
      })

      // Mock setOtpForEmail to update retry counts
      setOtpForEmail.mockImplementation((e, i, otpData) => {
        if (e === email && i === ip1) {
          userARetries = otpData.retries
        }
        if (e === email && i === ip2) {
          userBRetries = otpData.retries
        }
        return Promise.resolve()
      })

      // User A enters wrong OTP 3 times
      for (let i = 0; i < 3; i += 1) {
        const req = createRequestWithEmailAndIpAndOtp(email, ip1, 'wrong')
        const res = getMockResponse()
        // eslint-disable-next-line no-await-in-loop
        await controller.verifyOtp(req, res)
        expect(res.unauthorized).toHaveBeenCalled()
      }

      // User A should be locked out (OTP deleted)
      expect(deleteOtpByEmail).toHaveBeenCalledWith(email, ip1)

      // User B should still be able to try
      const req2 = createRequestWithEmailAndIpAndOtp(email, ip2, 'wrong')
      const res2 = getMockResponse()
      await controller.verifyOtp(req2, res2)

      // User B should still have retries left
      expect(setOtpForEmail).toHaveBeenCalledWith(email, ip2, {
        hashedOtp: otpA,
        retries: 2,
      })
    })
  })
})
