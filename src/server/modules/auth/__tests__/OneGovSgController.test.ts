import httpMocks from 'node-mocks-http'
import { Request } from 'express'
import { logger } from '../../../../../test/server/config'
import { OneGovSgController } from '..'

const loggerErrorSpy = jest.spyOn(logger, 'error')

function getMockResponse(): any {
  return {
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    render: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }
}

function createRequest(options: {
  query?: Record<string, unknown>
  signedCookies?: Record<string, string>
}): Request {
  const req = httpMocks.createRequest({
    session: {},
    query: options.query ?? {},
    signedCookies: options.signedCookies ?? {},
  })
  ;(req.session as any).regenerate = jest.fn((cb: (error?: Error) => void) =>
    cb(),
  )
  return req
}

const expectErrorPage = (res: any, status: number) => {
  expect(res.status).toHaveBeenCalledWith(status)
  expect(res.render).toHaveBeenCalledWith(
    'error.ejs',
    expect.objectContaining({ heading: expect.any(String) }),
  )
  expect(res.redirect).not.toHaveBeenCalled()
}

const issuer = 'https://one.gov.sg/api/auth'
const transaction = { state: 'state', nonce: 'nonce', verifier: 'verifier' }

describe('OneGovSgController', () => {
  const authService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
    genDBUserWithOfficerEmail: jest.fn(),
  }
  const oneGovSgService = {
    createTransaction: jest.fn(),
    getAuthorizationUrl: jest.fn(),
    handleCallback: jest.fn(),
  }
  const controller = new OneGovSgController(authService, oneGovSgService)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    test('rejects a mismatched iss query param', async () => {
      const req = createRequest({ query: { iss: 'https://evil.example' } })
      const res = getMockResponse()

      await controller.login(req, res)

      expectErrorPage(res, 400)
      expect(oneGovSgService.createTransaction).not.toHaveBeenCalled()
      expect(loggerErrorSpy).toHaveBeenCalled()
    })

    test('starts a fresh flow when iss matches (app-launcher case)', async () => {
      const req = createRequest({ query: { iss: issuer } })
      const res = getMockResponse()
      oneGovSgService.createTransaction.mockReturnValue(transaction)
      oneGovSgService.getAuthorizationUrl.mockResolvedValue(
        'https://one.gov.sg/authorize',
      )

      await controller.login(req, res)

      expect(res.cookie).toHaveBeenCalledWith(
        'oneGovSgTransaction',
        JSON.stringify(transaction),
        expect.objectContaining({ sameSite: 'lax', signed: true }),
      )
      expect(res.redirect).toHaveBeenCalledWith('https://one.gov.sg/authorize')
    })

    test('starts a fresh flow with no iss param (normal login click)', async () => {
      const req = createRequest({})
      const res = getMockResponse()
      oneGovSgService.createTransaction.mockReturnValue(transaction)
      oneGovSgService.getAuthorizationUrl.mockResolvedValue(
        'https://one.gov.sg/authorize',
      )

      await controller.login(req, res)

      expect(res.cookie).toHaveBeenCalledWith(
        'oneGovSgTransaction',
        JSON.stringify(transaction),
        expect.objectContaining({ sameSite: 'lax', signed: true }),
      )
      expect(res.redirect).toHaveBeenCalledWith('https://one.gov.sg/authorize')
    })

    test('carries a local deep link through the transaction, rejecting others', async () => {
      oneGovSgService.createTransaction.mockReturnValue(transaction)
      oneGovSgService.getAuthorizationUrl.mockResolvedValue('https://x')

      let res = getMockResponse()
      await controller.login(
        createRequest({ query: { next: '/user/links' } }),
        res,
      )
      expect(res.cookie).toHaveBeenCalledWith(
        'oneGovSgTransaction',
        JSON.stringify({ ...transaction, next: '/user/links' }),
        expect.anything(),
      )

      res = getMockResponse()
      await controller.login(
        createRequest({ query: { next: '//evil.example' } }),
        res,
      )
      expect(res.cookie).toHaveBeenCalledWith(
        'oneGovSgTransaction',
        JSON.stringify(transaction),
        expect.anything(),
      )
    })

    test('renders a 500 page when discovery fails', async () => {
      const req = createRequest({})
      const res = getMockResponse()
      oneGovSgService.createTransaction.mockReturnValue(transaction)
      oneGovSgService.getAuthorizationUrl.mockRejectedValue(
        new Error('discovery failed'),
      )

      await controller.login(req, res)

      expectErrorPage(res, 500)
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('discovery failed'),
      )
    })
  })

  describe('callback', () => {
    test('rejects when there is no pending transaction', async () => {
      const req = createRequest({ query: { code: 'abc' } })
      const res = getMockResponse()

      await controller.callback(req, res)

      expectErrorPage(res, 400)
      expect(oneGovSgService.handleCallback).not.toHaveBeenCalled()
    })

    test('stops before token exchange when the IdP returns an error, without reflecting it', async () => {
      const req = createRequest({
        query: {
          error: 'access_denied',
          error_description: '<script>alert(1)</script>',
        },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()

      await controller.callback(req, res)

      expectErrorPage(res, 400)
      expect(oneGovSgService.handleCallback).not.toHaveBeenCalled()
      expect(res.clearCookie).toHaveBeenCalledWith('oneGovSgTransaction')
      expect(JSON.stringify(res.render.mock.calls)).not.toContain('<script>')
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('<script>alert(1)</script>'),
      )
    })

    test('rejects a mismatched iss callback param', async () => {
      const req = createRequest({
        query: { iss: 'https://evil.example', code: 'abc' },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()

      await controller.callback(req, res)

      expectErrorPage(res, 400)
      expect(oneGovSgService.handleCallback).not.toHaveBeenCalled()
    })

    test('rejects a missing authorization code', async () => {
      const req = createRequest({
        query: { iss: issuer },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()

      await controller.callback(req, res)

      expectErrorPage(res, 400)
      expect(oneGovSgService.handleCallback).not.toHaveBeenCalled()
    })

    test('provisions and logs in the user on a valid callback', async () => {
      const req = createRequest({
        query: { iss: issuer, code: 'abc' },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()
      const user = { id: 1, email: 'officer@agency.test.sg' }
      oneGovSgService.handleCallback.mockResolvedValue(user.email)
      authService.genDBUserWithOfficerEmail.mockResolvedValue(user)

      await controller.callback(req, res)

      expect(oneGovSgService.handleCallback).toHaveBeenCalledWith(
        expect.objectContaining({ iss: issuer, code: 'abc' }),
        transaction,
      )
      expect(authService.genDBUserWithOfficerEmail).toHaveBeenCalledWith(
        user.email,
      )
      expect(req.session!.regenerate).toHaveBeenCalled()
      expect(req.session!.user).toStrictEqual(user)
      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    test('lands on the deep link stored in the transaction', async () => {
      const req = createRequest({
        query: { iss: issuer, code: 'abc' },
        signedCookies: {
          oneGovSgTransaction: JSON.stringify({
            ...transaction,
            next: '/user/links',
          }),
        },
      })
      const res = getMockResponse()
      oneGovSgService.handleCallback.mockResolvedValue('officer@agency.test.sg')
      authService.genDBUserWithOfficerEmail.mockResolvedValue({ id: 1 })

      await controller.callback(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/#/user/links')
    })

    test('denies a malformed sub with 403, not 500', async () => {
      const req = createRequest({
        query: { iss: issuer, code: 'abc' },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()
      oneGovSgService.handleCallback.mockResolvedValue('not-an-email.test.sg')

      await controller.callback(req, res)

      expectErrorPage(res, 403)
      expect(authService.genDBUserWithOfficerEmail).not.toHaveBeenCalled()
    })

    test('denies a verified officer outside the allowed email domain before provisioning', async () => {
      const req = createRequest({
        query: { iss: issuer, code: 'abc' },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()
      oneGovSgService.handleCallback.mockResolvedValue(
        'someone@not-allowed.example',
      )

      await controller.callback(req, res)

      expectErrorPage(res, 403)
      expect(authService.genDBUserWithOfficerEmail).not.toHaveBeenCalled()
      expect(req.session!.user).toBeUndefined()
    })

    test('fails closed when id_token verification throws', async () => {
      const req = createRequest({
        query: { iss: issuer, code: 'abc' },
        signedCookies: { oneGovSgTransaction: JSON.stringify(transaction) },
      })
      const res = getMockResponse()
      oneGovSgService.handleCallback.mockRejectedValue(
        new Error('nonce mismatch'),
      )

      await controller.callback(req, res)

      expectErrorPage(res, 400)
      expect(authService.genDBUserWithOfficerEmail).not.toHaveBeenCalled()
      expect(req.session!.user).toBeUndefined()
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('nonce mismatch'),
      )
    })
  })
})
