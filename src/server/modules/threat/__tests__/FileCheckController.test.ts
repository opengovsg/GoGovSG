import httpMocks from 'node-mocks-http'
import { Request } from 'express'

import { FileCheckController } from '..'

/**
 * Creates a mock request with mock file in request body.
 * @param  {any} user
 * @returns A mock Request with mock file.
 */
function createRequestWithFile(file: any): Request {
  // @ts-ignore
  return httpMocks.createRequest({
    files: { file },
  })
}

describe('FileCheckController test', () => {
  const file = { data: Buffer.from('data'), name: 'file.csv' }
  const hasAllowedType = jest.fn()

  const hasVirus = jest.fn()

  const controller = new FileCheckController({ hasAllowedType }, { hasVirus })
  const badRequest = jest.fn()

  beforeEach(() => {
    hasAllowedType.mockClear()
    hasVirus.mockClear()
    badRequest.mockClear()
  })

  it('does not invoke checks if no files', async () => {
    const req = createRequestWithFile(undefined)
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await controller.fileExtensionCheck(req, res, next)

    expect(hasAllowedType).not.toHaveBeenCalled()
    expect(hasVirus).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('does not accept file array', async () => {
    const req = createRequestWithFile([])
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    res.unprocessableEntity = badRequest

    await controller.fileExtensionCheck(req, res, next)

    expect(hasAllowedType).not.toHaveBeenCalled()
    expect(hasVirus).not.toHaveBeenCalled()
    expect(res.unprocessableEntity).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('returns bad request on file type failure', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    hasAllowedType.mockResolvedValue(false)
    res.unsupportedMediaType = badRequest

    await controller.fileExtensionCheck(req, res, next)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(hasVirus).not.toHaveBeenCalled()
    expect(res.unsupportedMediaType).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('returns bad request on virus scan failure', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const nextFunction1 = jest.fn()
    const nextFunction2 = jest.fn()

    hasAllowedType.mockResolvedValue(true)
    hasVirus.mockRejectedValue(false)
    res.badRequest = badRequest

    await controller.fileExtensionCheck(req, res, nextFunction1)
    await controller.fileVirusCheck(req, res, nextFunction2)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(hasVirus).toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(nextFunction1).toHaveBeenCalled()
    expect(nextFunction2).not.toHaveBeenCalled()
  })

  it('returns bad request on virulent file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const nextFunction1 = jest.fn()
    const nextFunction2 = jest.fn()

    hasAllowedType.mockResolvedValue(true)
    hasVirus.mockResolvedValue(true)
    res.badRequest = badRequest

    await controller.fileExtensionCheck(req, res, nextFunction1)
    await controller.fileVirusCheck(req, res, nextFunction2)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(hasVirus).toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(nextFunction1).toHaveBeenCalled()
    expect(nextFunction2).not.toHaveBeenCalled()
  })

  it('passes through on good file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    hasAllowedType.mockResolvedValue(true)
    hasVirus.mockResolvedValue(false)
    res.badRequest = badRequest
    res.serverError = badRequest

    await controller.fileExtensionCheck(req, res, next)
    await controller.fileVirusCheck(req, res, next)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(hasVirus).toHaveBeenCalled()
    expect(badRequest).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
