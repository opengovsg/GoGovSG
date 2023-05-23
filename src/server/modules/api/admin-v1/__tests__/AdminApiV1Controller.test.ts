import moment from 'moment'
import httpMocks from 'node-mocks-http'
import { ValidationError } from 'sequelize'
import { createRequestWithUser } from '../../../../../../test/server/api/util'
import { UrlV1Mapper } from '../../../../mappers/UrlV1Mapper'
import { AlreadyExistsError, NotFoundError } from '../../../../util/error'
import { AdminApiV1Controller } from '../AdminApiV1Controller'

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

const urlV1Mapper = new UrlV1Mapper()

const controller = new AdminApiV1Controller(
  userRepository,
  urlManagementService,
  urlV1Mapper,
)

/**
 * Unit tests for Admin API v1 controller.
 */
describe('AdminApiV1Controller', () => {
  describe('createUrl', () => {
    it('create, sanitize and transfer link to target email for admin API', async () => {
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
      userRepository.findOrCreateWithEmail.mockResolvedValue({
        id: userId,
        email,
        urls: undefined,
      })

      await controller.createUrl(req, res)
      expect(userRepository.findOrCreateWithEmail).toHaveBeenCalledWith(email)
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

    it('create and sanitize link with same owner and target email for admin API', async () => {
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
      userRepository.findOrCreateWithEmail.mockResolvedValue({
        id: 2,
        email,
        urls: undefined,
      })
      urlManagementService.changeOwnership.mockResolvedValue(result)

      await controller.createUrl(req, res)
      expect(userRepository.findOrCreateWithEmail).toHaveBeenCalledWith(email)
      expect(urlManagementService.createUrl).toHaveBeenCalledWith(
        userId,
        source,
        shortUrl,
        longUrl,
      )
      expect(urlManagementService.changeOwnership).toHaveBeenCalledWith(
        userId,
        shortUrl,
        email,
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

      userRepository.findOrCreateWithEmail.mockResolvedValue({})
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

      userRepository.findOrCreateWithEmail.mockResolvedValue({})
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

      userRepository.findOrCreateWithEmail.mockResolvedValue({})
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

      userRepository.findOrCreateWithEmail.mockResolvedValue({})
      urlManagementService.createUrl.mockRejectedValue(new Error())

      await controller.createUrl(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })
  })
})
