import httpMocks from 'node-mocks-http'
import { Request } from 'express'
import { BULK_UPLOAD_HEADER, BULK_UPLOAD_MAX } from '../../../constants'
import { BulkController } from '../BulkController'
import blackListedSites from '../../../resources/blacklist'
import { ogHostname } from '../../../config'

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

type UrlTest = {
  url: string
  testName: string
}

const invalidUrlTests: UrlTest[] = [
  {
    url: '',
    testName: 'fails with empty row',
  },
  {
    url: 'http://nusmods.com',
    testName: 'fails with non http url',
  },
  {
    url: 'https://nusmods.com,http://nusmods.com',
    testName: 'fails with a row with more than one column',
  },
  {
    url: `${blackListedSites[0]}`,
    testName: 'fails with a row with blacklisted url',
  },
  {
    url: 'https://nusmods.comヽ(•‿•)ノ',
    testName: 'fails with rows with invalid characters',
  },
  {
    url: `https://${ogHostname}/shortlink`,
    testName: 'fails with rows with circular redirects',
  },
  {
    url: Array(BULK_UPLOAD_MAX + 1)
      .fill(1)
      .map((_) => 'https://nusmods.com')
      .join('\r\n'),
    testName: 'fails with more than 1000 valid links',
  },
]

const validUrlTests: UrlTest[] = [
  {
    url: `https://nusmods.com`,
    testName: 'passes with one valid row',
  },
  {
    url: Array(BULK_UPLOAD_MAX)
      .fill(1)
      .map((_) => 'https://nusmods.com')
      .join('\r\n'),
    testName: 'passes with maximum valid rows',
  },
]
describe('BulkController test', () => {
  const controller = new BulkController()
  const badRequest = jest.fn()

  beforeEach(() => {
    badRequest.mockClear()
    jest.resetModules()
  })

  afterAll(jest.resetModules)

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

  validUrlTests.forEach((validUrlTest) => {
    it(validUrlTest.testName, async () => {
      const file = {
        data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\n${validUrlTest.url}`),
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
  })
  invalidUrlTests.forEach((invalidUrlTest) => {
    it(invalidUrlTest.testName, async () => {
      const file = {
        data: Buffer.from(`${BULK_UPLOAD_HEADER}\r\n${invalidUrlTest.url}`),
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
