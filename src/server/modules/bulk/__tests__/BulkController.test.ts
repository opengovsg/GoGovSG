import httpMocks from 'node-mocks-http'
import { Request } from 'express'
import { BULK_UPLOAD_HEADER } from '../../../constants'
import { BulkController } from '../BulkController'
import blackListedSites from '../../../resources/blacklist'

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

type InvalidUrlTest = {
  invalidUrl: string
  testName: string
}

const invalidUrlTests: InvalidUrlTest[] = [
  {
    invalidUrl: '',
    testName: 'fails with empty row',
  },
  {
    invalidUrl: 'http://nusmods.com`',
    testName: 'fails with non http url',
  },
  {
    invalidUrl: 'https://nusmods.com,http://nusmods.com',
    testName: 'fails with a row with more than one column',
  },
  {
    invalidUrl: `${blackListedSites[0]}`,
    testName: 'fails with a row with blacklisted url',
  },
  {
    invalidUrl: 'https://nusmods.comヽ(•‿•)ノ',
    testName: 'fails with rows with invalid characters',
  },
]
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
  invalidUrlTests.forEach((invalidUrlTest) => {
    it(invalidUrlTest.testName, async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER}\r\n${invalidUrlTest.invalidUrl}`,
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
})
