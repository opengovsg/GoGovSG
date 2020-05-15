import sinon from 'sinon'
import httpMocks from 'node-mocks-http'
import { createRequestWithUser } from './util'
import { logger } from '../config'
// import { container } from '../../../src/server/util/inversify'
// import { DependencyIds } from '../../../src/server/constants'
// import { OtpCache } from '../../../src/server/api/cache/otp'
// import { UserRepository } from '../../../src/server/api/repositories/user'
import {
  getEmailDomains,
  getIsLoggedIn,
  getLoginMessage,
} from '../../../src/server/api/login/handlers'
// import { mailOTP } from '../../../src/server/util/email'

jest.mock('../../../src/server/config', () => ({
  DEV_ENV: false,
  emailValidator: () => true,
  getOTP: () => '1',
  logger,
  loginMessage: 'login message',
  saltRounds: '',
  validEmailDomainGlobExpression: 'testEmailDomains',
}))

jest.mock('../../../src/server/util/email', () => ({
  mailOTP: sinon.fake(),
}))

function getMockResponse(): any {
  return {
    ok: sinon.fake(),
    notFound: sinon.fake(),
    send: sinon.fake(),
  }
}

describe('login middleware test', () => {
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
      expect(res.send.calledWith('testEmailDomains')).toBeTruthy()
    })
  })

  describe('generateOtp tests', () => {
    test('valid new email', () => {})
  })
})
