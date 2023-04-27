import moment from 'moment'
import httpMocks from 'node-mocks-http'
import { ValidationError } from 'sequelize'
import { createRequestWithUser } from '../../../../../../test/server/api/util'
import { UrlV2Mapper } from '../../../../mappers/UrlV2Mapper'
import { AlreadyExistsError, NotFoundError } from '../../../../util/error'
import { ApiV2Controller } from '../ApiV2Controller'

const urlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  bulkCreate: jest.fn(),
}

const userRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findOrCreateWithEmail: jest.fn(),
  findOneUrlForUser: jest.fn(),
  findUserByUrl: jest.fn(),
  findUrlsForUser: jest.fn(),
  saveApiKeyHash: jest.fn(),
  findUserByApiKey: jest.fn(),
  hasApiKey: jest.fn(),
}

const urlV2Mapper = new UrlV2Mapper()

const controller = new ApiV2Controller(
  userRepository,
  urlManagementService,
  urlV2Mapper,
)

/**
 * Unit tests for API v2 controller.
 */
describe('ApiV2Controller', () => {
  describe('createUrl', () => {
    it('creates link and sanitizes link for API', async () => {
      const userId = 1
      const shortUrl = 'abcdef'
      const longUrl = 'https://www.agency.sg'
      const state = 'ACTIVE'
      const source = 'API'
      const clicks = 0
      const contactEmail = 'person@open.gov.sg'
      const description = 'test description'
      const tags: string[] = []
      const tagStrings = ''
      const createdAt = moment().toISOString()
      const updatedAt = moment().toISOString()
      const email = 'person@domain.sg'

      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          email,
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
      expect(userRepository.findOrCreateWithEmail).toHaveBeenCalledWith(
        email,
        false,
      )
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

    it('reports bad request with user creation', async () => {
      const req = createRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()

      userRepository.findOrCreateWithEmail.mockRejectedValue(new Error())

      await controller.createUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
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
