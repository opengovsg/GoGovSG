import sinon from 'sinon'
import httpMocks from 'node-mocks-http'
import {
  createRequestWithEmail,
  createRequestWithEmailAndOtp,
  createRequestWithUser,
  getOtpCache,
  userModelMock,
} from './util'
import {
  generateOtp,
  getEmailDomains,
  getIsLoggedIn,
  getLoginMessage,
  verifyOtp,
} from '../../../src/server/api/login/handlers'
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

const loggerErrorSpy = jest.spyOn(logger, 'error')

jest.mock('../../../src/server/services/email', () => ({
  mailOTP: sinon.fake(),
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

const findOrCreateSpy = jest.spyOn(userModelMock, 'findOrCreate')

function getMockResponse(): any {
  return {
    ok: sinon.fake(),
    notFound: sinon.fake(),
    send: sinon.fake(),
    badRequest: sinon.fake(),
    serverError: sinon.fake(),
    unauthorized: sinon.fake(),
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
    test('session contains user', () => {
      const req = createRequestWithUser('fakeUser')
      const res = getMockResponse()

      getIsLoggedIn(req, res)
      expect(res.ok.lastCall.args[0].user).toBeTruthy()
    })

    test('session does not contain user', () => {
      const req = createRequestWithUser(undefined)
      const res = getMockResponse()

      getIsLoggedIn(req, res)
      expect(res.notFound.called).toBeTruthy()
    })
  })

  describe('getLoginMessage test', () => {
    test('returns login message', () => {
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      getLoginMessage(req, res)
      expect(res.send.calledWith('login message')).toBeTruthy()
    })
  })

  describe('getEmailDomains test', () => {
    test('returns domains', () => {
      const req = httpMocks.createRequest()
      const res = getMockResponse()

      getEmailDomains(req, res)
      expect(res.send.calledWith('*.test.sg')).toBeTruthy()
    })
  })

  describe('generateOtp tests', () => {
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

      await generateOtp(req, res)
      expect(spy).toBeCalledWith('aa@open.test.sg', '1')
      expect(res.ok.called).toBeTruthy()

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

      await generateOtp(req, res)
      expect(spy).toBeCalledTimes(1)
      expect(res.serverError.called).toBeTruthy()

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

      await generateOtp(req, res)
      expect(spy).toBeCalledTimes(0)
      expect(res.serverError.called).toBeTruthy()

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
      })

      afterEach(container.unbindAll)

      test('valid email and otp', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
        const res = getMockResponse()

        await verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toEqual('aa@open.test.sg')
        expect(res.ok.called).toBeTruthy()
      })

      test('valid email, wrong otp and expiring', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 1,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '0')
        const res = getMockResponse()

        await verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized.called).toBeTruthy()
      })

      test('valid email and no otp in cache', async () => {
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
        const res = getMockResponse()

        await verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toBe(null)
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized.called).toBeTruthy()
      })

      test('valid email and wrong otp with retries left', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp('aa@open.test.sg', '0')
        const res = getMockResponse()

        await verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toStrictEqual({
          hashedOtp: '1',
          retries: 99,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized.called).toBeTruthy()
      })

      test('no email and has valid otp in request', async () => {
        getOtpCache().setOtpForEmail('aa@open.test.sg', {
          hashedOtp: '1',
          retries: 100,
        })
        const req = createRequestWithEmailAndOtp(undefined, '1')
        const res = getMockResponse()

        await verifyOtp(req, res)

        await expect(
          getOtpCache().getOtpForEmail('aa@open.test.sg'),
        ).resolves.toStrictEqual({
          hashedOtp: '1',
          retries: 100,
        })
        expect(req.session!.user).toBeUndefined()
        expect(res.unauthorized.called).toBeTruthy()
      })
    })

    test('cache down', async () => {
      bindUserRepo()
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMockDown)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)
      const req = createRequestWithEmailAndOtp('aa@open.gov.sg', '1')
      const res = getMockResponse()

      await verifyOtp(req, res)

      expect(req.session!.user).toBeUndefined()
      expect(res.serverError.called).toBeTruthy()

      expect(logger.error).toBeCalled()
    })

    test('db down', async () => {
      bindUserRepo()
      container
        .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
        .to(OtpRepositoryMock)
      container
        .bind<Cryptography>(DependencyIds.cryptography)
        .to(CryptographyMock)
      getOtpCache().setOtpForEmail('aa@open.test.sg', {
        hashedOtp: '1',
        retries: 100,
      })
      const req = createRequestWithEmailAndOtp('aa@open.test.sg', '1')
      const res = getMockResponse()

      findOrCreateSpy.mockImplementationOnce(() => {
        return Promise.reject()
      })

      await verifyOtp(req, res)

      await expect(
        getOtpCache().getOtpForEmail('aa@open.test.sg'),
      ).resolves.toStrictEqual({ hashedOtp: '1', retries: 100 })
      expect(req.session!.user).toBeUndefined()
      expect(res.serverError.called).toBeTruthy()

      expect(logger.error).toBeCalled()
    })
  })
})
