import httpMocks from 'node-mocks-http'
import { Request } from 'express'

import { UrlCheckController } from '..'

/**
 * Creates a mock request with the input session user.
 * @param  {any} user
 * @returns A mock Request with the input session user.
 */
function createRequestWithUser(user: any): Request {
  return httpMocks.createRequest({
    session: {
      user,
    },
    body: {},
  })
}

const mockUrlThreatScanService = {
  isThreat: jest.fn(),
  isThreatBulk: jest.fn(),
}

describe('UrlCheckController test', () => {
  const url = 'https://example.com'

  const controller = new UrlCheckController(mockUrlThreatScanService)
  const badRequest = jest.fn()

  beforeEach(() => {
    mockUrlThreatScanService.isThreat.mockClear()
    badRequest.mockClear()
  })

  it('does not invoke checks if no urls', async () => {
    const req = createRequestWithUser(undefined)
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await controller.checkUrl(req, res, next)

    expect(mockUrlThreatScanService.isThreat).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('reports on server error', async () => {
    const req = createRequestWithUser(undefined)
    req.body.longUrl = url
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    mockUrlThreatScanService.isThreat.mockRejectedValue(false)
    res.serverError = badRequest

    await controller.checkUrl(req, res, next)

    expect(mockUrlThreatScanService.isThreat).toHaveBeenCalled()
    expect(badRequest).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects on bad URL', async () => {
    const req = createRequestWithUser(undefined)
    req.body.longUrl = url
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    mockUrlThreatScanService.isThreat.mockResolvedValue(true)
    res.badRequest = badRequest

    await controller.checkUrl(req, res, next)

    expect(mockUrlThreatScanService.isThreat).toHaveBeenCalled()
    expect(badRequest).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('passes through on good URL', async () => {
    const req = createRequestWithUser(undefined)
    req.body.longUrl = url
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    mockUrlThreatScanService.isThreat.mockResolvedValue(false)
    res.badRequest = badRequest
    res.serverError = badRequest

    await controller.checkUrl(req, res, next)

    expect(mockUrlThreatScanService.isThreat).toHaveBeenCalled()
    expect(badRequest).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
