/* eslint-disable import/prefer-default-export */
import httpMocks from 'node-mocks-http'
import { Request } from 'express'
import fileUpload from 'express-fileupload'

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
  const getExtensionAndMimeType = jest.fn()
  const hasAllowedExtensionType = jest.fn()

  const scanFile = jest.fn()

  const controller = new FileCheckController(
    { getExtensionAndMimeType, hasAllowedExtensionType },
    { scanFile },
  )
  const badRequest = jest.fn()

  beforeEach(() => {
    hasAllowedExtensionType.mockClear()
    getExtensionAndMimeType.mockClear()
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
    await controller.fileExtensionAndMimeTypeCheck()(
      req,
      res,
      afterFileExtensionCheck,
    )
    await controller.fileVirusCheck(req, res, afterFileVirusCheck)

    expect(hasAllowedExtensionType).not.toHaveBeenCalled()
    expect(getExtensionAndMimeType).not.toHaveBeenCalled()
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

    getExtensionAndMimeType.mockResolvedValue({
      extension: 'svg',
      mimeType: 'text/plain',
    })
    hasAllowedExtensionType.mockResolvedValue(false)

    res.unsupportedMediaType = badRequest

    await controller.fileExtensionAndMimeTypeCheck()(
      req,
      res,
      afterFileExtensionCheck,
    )

    expect(hasAllowedExtensionType).toHaveBeenCalled()
    expect(getExtensionAndMimeType).toHaveBeenCalled()
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

    hasAllowedExtensionType.mockResolvedValue(true)
    getExtensionAndMimeType.mockResolvedValue({
      extension: 'csv',
      mimeType: 'text/csv',
    })

    scanFile.mockResolvedValue(false)

    res.badRequest = badRequest
    res.serverError = badRequest
    res.unprocessableEntity = badRequest
    res.unsupportedMediaType = badRequest

    await controller.singleFileCheck(req, res, afterSingleFileCheck)
    await controller.fileExtensionAndMimeTypeCheck()(
      req,
      res,
      afterFileExtensionCheck,
    )
    await controller.fileVirusCheck(req, res, afterFileVirusCheck)
    expect(getExtensionAndMimeType).toHaveBeenCalled()
    expect(hasAllowedExtensionType).toHaveBeenCalled()
    expect(scanFile).toHaveBeenCalled()
    const fileUploaded = req.files?.file as fileUpload.UploadedFile | undefined
    expect(fileUploaded).toBeDefined()
    if (fileUploaded) {
      expect(fileUploaded.mimetype).toEqual('text/csv')
    }

    expect(res.badRequest).not.toHaveBeenCalled()
    expect(res.serverError).not.toHaveBeenCalled()
    expect(res.unprocessableEntity).not.toHaveBeenCalled()
    expect(res.unsupportedMediaType).not.toHaveBeenCalled()

    expect(afterSingleFileCheck).toHaveBeenCalled()
    expect(afterFileExtensionCheck).toHaveBeenCalled()
    expect(afterFileVirusCheck).toHaveBeenCalled()
  })

  it('unsupportedMediaType when file extension is empty', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any

    const afterSingleFileCheck = jest.fn()
    const afterFileExtensionCheck = jest.fn()

    scanFile.mockResolvedValue(false)

    res.badRequest = badRequest
    res.serverError = badRequest
    res.unprocessableEntity = badRequest
    res.unsupportedMediaType = badRequest

    getExtensionAndMimeType.mockResolvedValue({
      extension: '',
      mimeType: 'text/plain',
    })

    await controller.singleFileCheck(req, res, afterSingleFileCheck)
    await controller.fileExtensionAndMimeTypeCheck()(
      req,
      res,
      afterFileExtensionCheck,
    )

    expect(getExtensionAndMimeType).toHaveBeenCalled()
    expect(hasAllowedExtensionType).not.toHaveBeenCalled()
    expect(res.unsupportedMediaType).toHaveBeenCalled()
    expect(afterFileExtensionCheck).not.toHaveBeenCalled()
  })
})
