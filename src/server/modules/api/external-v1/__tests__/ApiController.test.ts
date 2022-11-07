import moment from 'moment'
import httpMocks from 'node-mocks-http'
import { ValidationError } from 'sequelize'
import { createRequestWithUser } from '../../../../../../test/server/api/util'
import { AlreadyExistsError, NotFoundError } from '../../../../util/error'
import { ApiController } from '../ApiController'

const urlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  bulkCreate: jest.fn(),
}

const controller = new ApiController(urlManagementService)

/**
 * Unit tests for API controller v1.
 */
describe('ApiController v1', () => {
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
        shortUrl,
        source,
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

    it('reports bad request on generic Error', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      urlManagementService.createUrl.mockRejectedValue(new Error())

      await controller.createUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })
  })
})
