import httpMocks from 'node-mocks-http'
import {
  createRequestWithEmail,
  createRequestWithEmailAndOtp,
  createRequestWithUser,
  getOtpCache,
  userModelMock,
} from '../api/util'
import { container } from '../../../src/server/util/inversify'
import { Mailer } from '../../../src/server/services/email'
import { MailerMock, MailerMockDown } from '../mocks/services/email'
import { DependencyIds } from '../../../src/server/constants'
import { Cryptography } from '../../../src/server/services/cryptography'
import CryptographyMock from '../mocks/services/cryptography'
import {
  OtpRepositoryMock,
  OtpRepositoryMockDown,
} from '../mocks/repositories/OtpRepository'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { logger } from '../config'
import { UserRepository } from '../../../src/server/repositories/UserRepository'
import { UserMapper } from '../../../src/server/mappers/UserMapper'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { Mapper } from '../../../src/server/mappers/Mapper'
import {
  StorableUrl,
  StorableUser,
} from '../../../src/server/repositories/types'
import { UrlType } from '../../../src/server/models/url'
import { UserType } from '../../../src/server/models/user'
import { OtpRepositoryInterface } from '../../../src/server/repositories/interfaces/OtpRepositoryInterface'
import { LoginController } from '../../../src/server/controllers/LoginController'
import { AuthServiceInterface } from '../../../src/server/services/interfaces/AuthServiceInterface'
import { AuthService } from '../../../src/server/services/AuthService'

const loggerErrorSpy = jest.spyOn(logger, 'error')

jest.mock('../../../src/server/services/email', () => ({
  mailOTP: jest.fn(),
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

const findOrCreateSpy = jest.spyOn(userModelMock, 'findOrCreate')

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

function bindUserRepo() {
  container
    .bind<Mapper<StorableUrl, UrlType>>(DependencyIds.urlMapper)
    .to(UrlMapper)
  container
    .bind<Mapper<StorableUser, UserType>>(DependencyIds.userMapper)
    .to(UserMapper)
  container
    .bind<UserRepositoryInterface>(DependencyIds.userRepository)
    .to(UserRepository)
}

/**
 * Integration tests for login middleware. I.e UserRepository is not mocked.
 */
describe('login middleware tests', () => {
  afterEach(() => {
    container.unbindAll()
    loggerErrorSpy.mockClear()
  })
  describe('getIsLoggedIn tests', () => {
    beforeEach(() => {
      container.bind(DependencyIds.authService).toConstantValue(null)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)
    })
    test('session contains user', () => {
      const req = createRequestWithUser('fakeUser')
      const res = getMockResponse()

      container
        .get<LoginController>(DependencyIds.loginController)
        .getIsLoggedIn(req, res)
      expect(res.ok).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'fakeUser' }),
      )
    })

    test('session does not contain user', () => {
      const req = createRequestWithUser(undefined)
      const res = getMockResponse()

      container
        .get<LoginController>(DependencyIds.loginController)
        .getIsLoggedIn(req, res)
      expect(res.notFound).toHaveBeenCalled()
    })
  })

  describe('getLoginMessage test', () => {
    test('returns login message', () => {
      container.bind(DependencyIds.authService).toConstantValue(null)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)

      const req = httpMocks.createRequest()
      const res = getMockResponse()

      container
        .get<LoginController>(DependencyIds.loginController)
        .getLoginMessage(req, res)
      expect(res.send).toHaveBeenCalledWith('login message')
    })
  })

  describe('getEmailDomains test', () => {
    test('returns domains', () => {
      container.bind(DependencyIds.authService).toConstantValue(null)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      container
        .get<LoginController>(DependencyIds.loginController)
        .getEmailDomains(req, res)
      expect(res.send).toHaveBeenCalledWith('*.test.sg')
    })
  })

  describe('generateOtp tests', () => {
    beforeEach(() => {
      bindUserRepo()
      container
        .bind<AuthServiceInterface>(DependencyIds.authService)
        .to(AuthService)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)
    })
    test('valid new email', async () => {
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMock)
      container.bind<Mailer>(DependencyIds.mailer).to(MailerMock)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)

      const req = createRequestWithEmail('aa@open.test.sg')
      const res = getMockResponse()
      const spy = jest.spyOn(
        container.get<Mailer>(DependencyIds.mailer),
        'mailOTP',
      )

      await container
        .get<LoginController>(DependencyIds.loginController)
        .generateOtp(req, res)
      expect(spy).toBeCalledWith('aa@open.test.sg', '1', '1.1.1.1')
      expect(res.ok).toHaveBeenCalled()

      const cache = getOtpCache() as OtpRepositoryMock
      const storedOtp = cache.cache.get('aa@open.test.sg')
      if (!storedOtp) {
        throw Error('Should not be falsy')
      } else {
        expect(storedOtp.hashedOtp).toBe('1')
      }

      spy.mockClear()
    })
    test('email server down', async () => {
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMock)
      container.bind<Mailer>(DependencyIds.mailer).to(MailerMockDown)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)

      const req = createRequestWithEmail('aa@open.test.sg')
      const res = getMockResponse()
      const spy = jest.spyOn(
        container.get<Mailer>(DependencyIds.mailer),
        'mailOTP',
      )

      await container
        .get<LoginController>(DependencyIds.loginController)
        .generateOtp(req, res)
      expect(spy).toBeCalledTimes(1)
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()

      spy.mockClear()
    })

    test('cache down', async () => {
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMockDown)
      container.bind<Mailer>(DependencyIds.mailer).to(MailerMock)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)

      const req = createRequestWithEmail('aa@open.test.sg')
      const res = getMockResponse()
      const spy = jest.spyOn(
        container.get<Mailer>(DependencyIds.mailer),
        'mailOTP',
      )

      await container
        .get<LoginController>(DependencyIds.loginController)
        .generateOtp(req, res)
      expect(spy).toBeCalledTimes(0)
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()

      spy.mockClear()
    })
  })

  describe('verifyOtp tests', () => {
    describe('With all services up', () => {
      beforeEach(() => {
        bindUserRepo()
        container
          .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
          .to(OtpRepositoryMock)
        container
          .bind<Cryptography>(DependencyIds.cryptography)
          .to(CryptographyMock)
        container
          .bind<AuthServiceInterface>(DependencyIds.authService)
          .to(AuthService)
        container
          .bind<LoginController>(DependencyIds.loginController)
          .to(LoginController)
        container.bind<Mailer>(DependencyIds.mailer).to(MailerMock)
      })

      afterEach(container.unbindAll)

      test('valid email and otp', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
        const res = getMockResponse()

        await container
          .get<LoginController>(DependencyIds.loginController)
          .verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toEqual('aa@open.test.sg')
        expect(res.ok).toHaveBeenCalled()
      })

      test('valid email, wrong otp and expiring', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 1,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '0')
        const res = getMockResponse()

        await container
          .get<LoginController>(DependencyIds.loginController)
          .verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and no otp in cache', async () => {
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
        const res = getMockResponse()

        await container
          .get<LoginController>(DependencyIds.loginController)
          .verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('valid email and wrong otp with retries left', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '0')
        const res = getMockResponse()

        await container
          .get<LoginController>(DependencyIds.loginController)
          .verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toStrictEqual({
          hashedOtp: '1',
          retries: 99,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })

      test('no email and has valid otp in request', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp(undefined, '1')
        const res = getMockResponse()

        await container
          .get<LoginController>(DependencyIds.loginController)
          .verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toStrictEqual({
          hashedOtp: '1',
          retries: 100,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized).toHaveBeenCalled()
      })
    })

    test('cache down', async () => {
      bindUserRepo()
      container.bind<Mailer>(DependencyIds.mailer).to(MailerMock)
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMockDown)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)
      container
        .bind<AuthServiceInterface>(DependencyIds.authService)
        .to(AuthService)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)
      const req = createRequestWithEmailAndOtp('aa@open.gov.sg', '1')
      const res = getMockResponse()

      await container
        .get<LoginController>(DependencyIds.loginController)
        .verifyOtp(req, res)

      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })

    test('db down', async () => {
      bindUserRepo()
      container.bind<Mailer>(DependencyIds.mailer).to(MailerMock)
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMock)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)
      container
        .bind<AuthServiceInterface>(DependencyIds.authService)
        .to(AuthService)
      container
        .bind<LoginController>(DependencyIds.loginController)
        .to(LoginController)
      getOtpCache().setOtpForEmail('aa@open.test.sg', {
        hashedOtp: '1',
        retries: 100,
      })
      const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
      const res = getMockResponse()

      findOrCreateSpy.mockImplementationOnce(() => {
        return Promise.reject()
      })

      await container
        .get<LoginController>(DependencyIds.loginController)
        .verifyOtp(req, res)

      await expect(
        getOtpCache().getOtpForEmail('aa@open.test.sg'),
      ).resolves.toStrictEqual({ hashedOtp: '1', retries: 100 })
      expect(req.session!.user).toBeUndefined()
      expect(res.serverError).toHaveBeenCalled()

      expect(logger.error).toBeCalled()
    })
  })
})
