import moment from 'moment'
import httpMocks from 'node-mocks-http'
import { ValidationError } from 'sequelize'
import { createRequestWithUser } from '../../../../../../test/server/api/util'
import { UrlV1Mapper } from '../../../../mappers/UrlV1Mapper'
import {
  AlreadyExistsError,
  InvalidUrlUpdateError,
  NotFoundError,
} from '../../../../util/error'
import { ApiV1Controller } from '../ApiV1Controller'

const urlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  bulkCreate: jest.fn(),
  deactivateMaliciousShortUrl: jest.fn(),
}

const urlThreatScanService = {
  isThreat: jest.fn(),
  isThreatBulk: jest.fn(),
}

const urlV1Mapper = new UrlV1Mapper()

const controller = new ApiV1Controller(
  urlManagementService,
  urlV1Mapper,
  urlThreatScanService,
)

/**
 * Unit tests for API v1 controller.
 */
describe('ApiV1Controller', () => {
  describe('createUrl', () => {
    it('creates link and sanitizes link for API', async () => {
      const userId = 1
      const shortUrl = 'abcdef'
      const longUrl = 'https://www.agency.gov.sg'
      const state = 'ACTIVE'
      const source = 'API'
      const clicks = 0
      const contactEmail = 'person@open.gov.sg'
      const description = 'test description'
      const tags: string[] = []
      const tagStrings = ''
      const createdAt = moment().toISOString()
      const updatedAt = moment().toISOString()

      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()

      const result = {
        shortUrl,
        longUrl,
        state,
        source,
        clicks,
        contactEmail,
        description,
        tags,
        tagStrings,
        createdAt,
        updatedAt,
      }
      urlManagementService.createUrl.mockResolvedValue(result)

      await controller.createUrl(req, res)
      expect(urlManagementService.createUrl).toHaveBeenCalledWith(
        userId,
        source,
        shortUrl,
        longUrl,
      )
      expect(res.ok).toHaveBeenCalledWith({
        shortUrl,
        longUrl,
        state,
        clicks,
        createdAt,
        updatedAt,
      })
    })

    it('reports not found on NotFoundError', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.notFound = jest.fn()

      urlManagementService.createUrl.mockRejectedValue(new NotFoundError(''))

      await controller.createUrl(req, res)
      expect(res.notFound).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('reports bad request on AlreadyExistsError', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      urlManagementService.createUrl.mockRejectedValue(
        new AlreadyExistsError(''),
      )

      await controller.createUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
        type: expect.any(String),
      })
    })

    it('reports bad request on Sequelize.ValidationError', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      urlManagementService.createUrl.mockRejectedValue(
        new ValidationError('', []),
      )

      await controller.createUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('reports server error on generic Error', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.serverError = jest.fn()

      urlManagementService.createUrl.mockRejectedValue(new Error())

      await controller.createUrl(req, res)
      expect(res.serverError).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })
  })

  describe('bulkCreateUrls', () => {
    const userId = 1
    const longUrl = 'https://www.agency.gov.sg'
    const shortUrl = 'abcdef'
    const createdAt = moment().toISOString()
    const updatedAt = moment().toISOString()
    const createdUrl = {
      shortUrl,
      longUrl,
      state: 'ACTIVE',
      source: 'API',
      clicks: 0,
      contactEmail: 'person@open.gov.sg',
      description: 'test description',
      tags: [],
      tagStrings: '',
      createdAt,
      updatedAt,
    }
    const dto = {
      shortUrl,
      longUrl,
      state: 'ACTIVE',
      clicks: 0,
      createdAt,
      updatedAt,
    }

    beforeEach(() => {
      urlManagementService.createUrl.mockReset()
      urlThreatScanService.isThreat.mockReset()
      urlThreatScanService.isThreat.mockResolvedValue(false)
    })

    it('creates all valid rows and returns 200', async () => {
      const req = httpMocks.createRequest({
        body: { userId, urls: [{ shortUrl, longUrl }] },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      urlManagementService.createUrl.mockResolvedValue(createdUrl)

      await controller.bulkCreateUrls(req, res)
      expect(urlManagementService.createUrl).toHaveBeenCalledWith(
        userId,
        'API',
        shortUrl,
        longUrl,
      )
      expect(res.ok).toHaveBeenCalledWith({ created: [dto], errors: [] })
    })

    it('returns partial success with row validation errors', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          urls: [{ shortUrl, longUrl }, { longUrl: 'not-a-url' }],
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      urlManagementService.createUrl.mockResolvedValue(createdUrl)

      await controller.bulkCreateUrls(req, res)
      expect(res.ok).toHaveBeenCalledWith({
        created: [dto],
        errors: [
          {
            index: 1,
            message: 'Only HTTPS URLs are allowed.',
            type: 'LongUrlError',
          },
        ],
      })
    })

    it('returns 400 when every row fails', async () => {
      const req = httpMocks.createRequest({
        body: { userId, urls: [{ longUrl: 'not-a-url' }] },
      })
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      await controller.bulkCreateUrls(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        created: [],
        errors: [
          {
            index: 0,
            message: 'Only HTTPS URLs are allowed.',
            type: 'LongUrlError',
          },
        ],
      })
    })

    it('reports duplicate shortUrl within the same request', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          urls: [
            { shortUrl, longUrl },
            { shortUrl, longUrl: 'https://www.agency2.gov.sg' },
          ],
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      urlManagementService.createUrl.mockResolvedValue(createdUrl)

      await controller.bulkCreateUrls(req, res)
      expect(urlManagementService.createUrl).toHaveBeenCalledTimes(1)
      expect(res.ok).toHaveBeenCalledWith({
        created: [dto],
        errors: [
          {
            index: 1,
            message: `Short link "${shortUrl}" is already used.`,
            type: 'ShortUrlError',
          },
        ],
      })
    })

    it('reports malicious links as row errors', async () => {
      const req = httpMocks.createRequest({
        body: { userId, urls: [{ shortUrl, longUrl }] },
      })
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()
      urlThreatScanService.isThreat.mockResolvedValue(true)

      await controller.bulkCreateUrls(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        created: [],
        errors: [
          {
            index: 0,
            message:
              'Link is likely to be malicious, please contact us for further assistance',
          },
        ],
      })
    })

    it('reports shortUrl collision from createUrl as row error', async () => {
      const req = httpMocks.createRequest({
        body: { userId, urls: [{ shortUrl, longUrl }] },
      })
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()
      urlManagementService.createUrl.mockRejectedValue(
        new AlreadyExistsError(`Short link "${shortUrl}" is already used.`),
      )

      await controller.bulkCreateUrls(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        created: [],
        errors: [
          {
            index: 0,
            message: `Short link "${shortUrl}" is already used.`,
            type: 'ShortUrlError',
          },
        ],
      })
    })
  })

  describe('getUrlsWithConditions', () => {
    beforeEach(() => {
      urlManagementService.getUrlsWithConditions.mockReset()
    })
    it('processes query with defaults', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith({
        limit: 1000,
        offset: 0,
        orderBy: 'createdAt',
        sortDirection: 'desc',
        searchText: '',
        userId: 1,
        state: undefined,
        isFile: undefined,
      })
    })

    it('processes query with specified parameters and maps urls for API', async () => {
      const userId = 2
      const limit = 500
      const offset = 1
      const orderBy = 'clicks'
      const sortDirection = 'asc'
      const searchText = 'text'
      const state = 'ACTIVE'

      const source = 'API'
      const clicks = 0
      const tags: string[] = []
      const tagStrings = ''
      const createdAt = moment().toISOString()
      const updatedAt = moment().toISOString()
      const contactEmail = 'person@open.gov.sg'
      const description = 'test description'

      const req = httpMocks.createRequest({
        body: { userId },
        query: {
          limit,
          offset,
          orderBy,
          sortDirection,
          searchText,
          state,
        },
      })

      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = {
        urls: [
          {
            shortUrl: 'abc',
            longUrl: 'https://www.agency.gov.sg',
            state,
            clicks,
            createdAt,
            updatedAt,
            isFile: true,
            source,
            tags,
            tagStrings,
            contactEmail,
            description,
          },
          {
            shortUrl: 'def',
            longUrl: 'https://www.agency2.gov.sg',
            state,
            clicks,
            createdAt,
            updatedAt,
            isFile: false,
            source,
            tags,
            tagStrings,
            contactEmail,
            description,
          },
        ],
        count: 2,
      }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith({
        urls: [
          {
            shortUrl: 'abc',
            longUrl: 'https://www.agency.gov.sg',
            state,
            clicks,
            createdAt,
            updatedAt,
          },
          {
            shortUrl: 'def',
            longUrl: 'https://www.agency2.gov.sg',
            state,
            clicks,
            createdAt,
            updatedAt,
          },
        ],
        count: 2,
      })
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith({
        limit,
        offset,
        orderBy,
        sortDirection,
        searchText,
        userId,
        state,
        isFile: undefined,
      })
    })

    it('processes query with isFile=true', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: true },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith(
        expect.objectContaining({ isFile: true }),
      )
    })

    it('processes query with isFile=false', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: false },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith(
        expect.objectContaining({ isFile: false }),
      )
    })

    it('reports serverError on Error', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.serverError = jest.fn()
      const serverError = new Error()
      urlManagementService.getUrlsWithConditions.mockRejectedValue(serverError)

      await controller.getUrlsWithConditions(req, res)
      expect(res.serverError).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })
  })

  describe('updateUrl', () => {
    const userId = 2
    const shortUrl = 'abcdef'
    const longUrl = 'https://www.agency.gov.sg'

    it('processes link updates with no state', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()

      const result = { shortUrl }
      urlManagementService.updateUrl.mockResolvedValue(result)

      await controller.updateUrl(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.updateUrl).toHaveBeenCalledWith(
        userId,
        shortUrl,
        {
          longUrl,
          state: undefined,
        },
      )
    })

    it('processes link updates with active state', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          state: 'ACTIVE',
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()

      const result = { shortUrl }
      urlManagementService.updateUrl.mockResolvedValue(result)

      await controller.updateUrl(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.updateUrl).toHaveBeenCalledWith(
        userId,
        shortUrl,
        {
          longUrl,
          state: 'ACTIVE',
        },
      )
    })

    it('processes link updates with inactive state', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          state: 'INACTIVE',
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()

      const result = { shortUrl }
      urlManagementService.updateUrl.mockResolvedValue(result)

      await controller.updateUrl(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.updateUrl).toHaveBeenCalledWith(
        userId,
        shortUrl,
        {
          longUrl,
          state: 'INACTIVE',
        },
      )
    })

    it('reports bad request on Error', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      urlManagementService.updateUrl.mockRejectedValue(new Error())

      await controller.updateUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('reports bad request on InvalidUrlUpdateError', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      urlManagementService.updateUrl.mockRejectedValue(
        new InvalidUrlUpdateError(''),
      )

      await controller.updateUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('reports forbidden request on NotFoundError', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.forbidden = jest.fn()

      urlManagementService.updateUrl.mockRejectedValue(new NotFoundError(''))

      await controller.updateUrl(req, res)
      expect(res.forbidden).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })
  })
})
