import httpMocks from 'node-mocks-http'
import { Request } from 'express'
import { BULK_UPLOAD_HEADER } from '../../../constants'
import { BulkController } from '../BulkController'

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

describe('BulkController test', () => {
  const controller = new BulkController()
  const badRequest = jest.fn()

  beforeEach(() => {
    badRequest.mockClear()
  })

  it('does not accept file array', async () => {
    const req = createRequestWithFile([])
    const res: any = httpMocks.createResponse()
    res.unprocessableEntity = badRequest

    await controller.csvValidation(req, res)
    expect(res.unprocessableEntity).toHaveBeenCalledWith({
      message: expect.any(String),
    })
  })

  it('does not invoke checks if no file', async () => {
    const req = createRequestWithFile(undefined)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)
    expect(res.badRequest).toHaveBeenCalledWith({
      message: expect.any(String),
    })
  })

  it('passes with valid file', async () => {
    const file = {
      data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\nhttps://nusmods.com`),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.ok = jest.fn()

    await controller.csvValidation(req, res)

    expect(res.ok).toHaveBeenCalledWith({
      isValid: true,
    })
  })
  it('fails with empty url', async () => {
    const file = {
      data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\n'`),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)

    expect(res.badRequest).toHaveBeenCalledWith({
      isValid: false,
    })
  })
  it('fails with non https url', async () => {
    const file = {
      data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\nhttp://nusmods.com`),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)

    expect(res.badRequest).toHaveBeenCalledWith({
      isValid: false,
    })
  })
  it('fails with a row with more than one column', async () => {
    const file = {
      data: Buffer.from(
        `${BULK_UPLOAD_HEADER}\r\nhttps://nusmods.com,http://nusmods.com`,
      ),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)

    expect(res.badRequest).toHaveBeenCalledWith({
      isValid: false,
    })
  })
  it('fails with a row with blacklisted url', async () => {
    const file = {
      data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\nhttps://rebrand.ly`),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)

    expect(res.badRequest).toHaveBeenCalledWith({
      isValid: false,
    })
  })
  it('fails with rows with invalid characters', async () => {
    const file = {
      data: Buffer.from(
        `${BULK_UPLOAD_HEADER}\r\nhttps://nusmods.comヽ(•‿•)ノ`,
      ),
      name: 'file.csv',
    }

    const req = createRequestWithFile(file)
    const res: any = httpMocks.createResponse()
    res.badRequest = badRequest

    await controller.csvValidation(req, res)

    expect(res.badRequest).toHaveBeenCalledWith({
      isValid: false,
    })
  })
})
