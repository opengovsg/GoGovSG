/* eslint-disable import/prefer-default-export */
import httpMocks from 'node-mocks-http'
import { Request } from 'express'

import { FileCheckController } from '..'

/**
 * Creates a mock request with mock file in request body.
 * @param  {any} file
 * @returns A mock Request with mock file.
 */
export function createRequestWithFile(file: any): Request {
  // @ts-ignore
  return httpMocks.createRequest({
    files: { file },
  })
}

describe('FileCheckController test', () => {
  const file = { data: Buffer.from('data'), name: 'file.csv' }
  const getExtension = jest.fn()
  const hasAllowedType = jest.fn()

  const scanFile = jest.fn()

  const controller = new FileCheckController(
    { getExtension, hasAllowedType },
    { scanFile },
  )
  const badRequest = jest.fn()

  beforeEach(() => {
    hasAllowedType.mockClear()
    scanFile.mockClear()
    badRequest.mockClear()
  })

  it('does not invoke checks if no files', async () => {
    const req = createRequestWithFile(undefined)
    const res = httpMocks.createResponse()
    const afterSingleFileCheck = jest.fn()
    const afterFileExtensionCheck = jest.fn()
    const afterFileVirusCheck = jest.fn()
    await controller.singleFileCheck(req, res, afterSingleFileCheck)
    await controller.fileExtensionCheck()(req, res, afterFileExtensionCheck)
    await controller.fileVirusCheck(req, res, afterFileVirusCheck)

    expect(hasAllowedType).not.toHaveBeenCalled()
    expect(scanFile).not.toHaveBeenCalled()
    expect(afterSingleFileCheck).toHaveBeenCalled()
    expect(afterFileExtensionCheck).toHaveBeenCalled()
    expect(afterFileVirusCheck).toHaveBeenCalled()
  })

  it('does not accept file array', async () => {
    const req = createRequestWithFile([])
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    res.unprocessableEntity = badRequest

    await controller.singleFileCheck(req, res, next)

    expect(res.unprocessableEntity).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('unsupportedMediaType when file extension is not valid', async () => {
    const nonCsvFile = { data: Buffer.from('data'), name: 'file.dasds' }

    const req = createRequestWithFile(nonCsvFile)
    const res = httpMocks.createResponse() as any
    const afterFileExtensionCheck = jest.fn()

    hasAllowedType.mockResolvedValue(false)
    res.unsupportedMediaType = badRequest

    await controller.fileExtensionCheck()(req, res, afterFileExtensionCheck)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(res.unsupportedMediaType).toHaveBeenCalled()
    expect(afterFileExtensionCheck).not.toHaveBeenCalled()
  })

  it('returns bad request on virus scan failure', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const afterFileVirusCheck = jest.fn()

    scanFile.mockRejectedValue(new Error())
    res.badRequest = badRequest

    await controller.fileVirusCheck(req, res, afterFileVirusCheck)

    expect(scanFile).toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(afterFileVirusCheck).not.toHaveBeenCalled()
  })

  it('returns bad request on virulent file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const afterFileVirusCheck = jest.fn()

    scanFile.mockResolvedValue({ hasVirus: true, isPasswordProtected: false })
    res.badRequest = badRequest

    await controller.fileVirusCheck(req, res, afterFileVirusCheck)

    expect(scanFile).toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(afterFileVirusCheck).not.toHaveBeenCalled()
  })

  it('passes through on good file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any

    const afterSingleFileCheck = jest.fn()
    const afterFileExtensionCheck = jest.fn()
    const afterFileVirusCheck = jest.fn()

    hasAllowedType.mockResolvedValue(true)
    scanFile.mockResolvedValue(false)

    res.badRequest = badRequest
    res.serverError = badRequest
    res.unprocessableEntity = badRequest
    res.unsupportedMediaType = badRequest

    await controller.singleFileCheck(req, res, afterSingleFileCheck)
    await controller.fileExtensionCheck()(req, res, afterFileExtensionCheck)
    await controller.fileVirusCheck(req, res, afterFileVirusCheck)

    expect(hasAllowedType).toHaveBeenCalled()
    expect(scanFile).toHaveBeenCalled()

    expect(res.badRequest).not.toHaveBeenCalled()
    expect(res.serverError).not.toHaveBeenCalled()
    expect(res.unprocessableEntity).not.toHaveBeenCalled()
    expect(res.unsupportedMediaType).not.toHaveBeenCalled()

    expect(afterSingleFileCheck).toHaveBeenCalled()
    expect(afterFileExtensionCheck).toHaveBeenCalled()
    expect(afterFileVirusCheck).toHaveBeenCalled()
  })
})
