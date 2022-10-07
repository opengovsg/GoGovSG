/* eslint-disable global-require */
import httpMocks from 'node-mocks-http'
import { ValidationError } from 'sequelize'
import { StorableUrlState } from '../../../repositories/enums'
import {
  createGetTagsRequestWithUser,
  createRequestWithUser,
} from '../../../../../test/server/api/util'

import { UserController } from '../UserController'
import { AlreadyExistsError, NotFoundError } from '../../../util/error'

const urlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  bulkCreate: jest.fn(),
}

const tagManagementService = {
  getTagsWithConditions: jest.fn(),
}

const tagManagementService = {
  getTagsWithConditions: jest.fn(),
}

const userMessage = 'The quick brown fox jumps over a lazy dog'
const userAnnouncement = {
  title: 'title',
  message: 'message',
  url: 'https://go.gov.sg',
  image: '/favicon.ico',
}

describe('UserController', () => {
  const controller = new UserController(
    urlManagementService,
    userMessage,
    userAnnouncement,
    tagManagementService,
  )

  describe('createUrl', () => {
    it('rejects multiple file uploads', async () => {
      const req = httpMocks.createRequest({
        files: {
          // @ts-ignore
          file: [],
        },
      })
      const res: any = httpMocks.createResponse()
      res.unprocessableEntity = jest.fn()

      await controller.createUrl(req, res)
      expect(res.unprocessableEntity).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('processes link creation', async () => {
      const userId = 1
      const shortUrl = 'abcdef'
      const longUrl = 'https://www.agency.gov.sg'
      const tags = ['tag1', 'tag2', 'tag3']
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          tags,
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()

      const result = { shortUrl }
      urlManagementService.createUrl.mockResolvedValue(result)

      await controller.createUrl(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.createUrl).toHaveBeenCalledWith(
        userId,
        shortUrl,
        longUrl,
        undefined,
        tags,
      )
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

  describe('updateUrl', () => {
    const userId = 2
    const shortUrl = 'abcdef'
    const longUrl = 'https://www.agency.gov.sg'
    const description = 'A Description'

    it('rejects multiple file uploads', async () => {
      const req = httpMocks.createRequest({
        files: {
          // @ts-ignore
          file: [],
        },
      })
      const res: any = httpMocks.createResponse()
      res.unprocessableEntity = jest.fn()

      await controller.updateUrl(req, res)
      expect(res.unprocessableEntity).toHaveBeenCalledWith({
        message: expect.any(String),
      })
    })

    it('processes link updates with no state', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          description,
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
          file: undefined,
          contactEmail: undefined,
          description,
        },
      )
    })

    it('processes link updates with active state and null contactEmail', async () => {
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          description,
          contactEmail: null,
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
          state: StorableUrlState.Active,
          file: undefined,
          contactEmail: null,
          description,
        },
      )
    })

    it('processes link updates with inactive state and contactEmail', async () => {
      const contactEmail = 'contact-us@agency.gov.sg'
      const req = httpMocks.createRequest({
        body: {
          userId,
          shortUrl,
          longUrl,
          description,
          contactEmail,
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
          state: StorableUrlState.Inactive,
          file: undefined,
          contactEmail,
          description,
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
  })

  describe('changeOwnership', () => {
    const userId = 2
    const shortUrl = 'abcdef'
    const newUserEmail = 'new-user@agency.gov.sg'

    const req = httpMocks.createRequest({
      body: {
        userId,
        shortUrl,
        newUserEmail,
      },
    })

    it('changes ownership', async () => {
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      urlManagementService.changeOwnership.mockResolvedValue({ shortUrl })
      await controller.changeOwnership(req, res)
      expect(res.ok).toHaveBeenCalledWith({ shortUrl })
      expect(urlManagementService.changeOwnership).toHaveBeenCalledWith(
        userId,
        shortUrl,
        newUserEmail,
      )
    })

    it('reports badRequest on Error', async () => {
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()
      urlManagementService.changeOwnership.mockRejectedValue(
        new Error('Not Found'),
      )
      await controller.changeOwnership(req, res)
      expect(res.badRequest).toHaveBeenCalledWith({
        message: expect.any(String),
      })
      expect(urlManagementService.changeOwnership).toHaveBeenCalledWith(
        userId,
        shortUrl,
        newUserEmail,
      )
    })
  })

  describe('getTagsWithConditions', () => {
    it('make sure urlManagementService.getTagsWithConditions is called exactly 1 time', async () => {
      const req = createGetTagsRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      await controller.getTagsWithConditions(req, res)
      expect(tagManagementService.getTagsWithConditions).toHaveBeenCalledTimes(
        1,
      )
    })
    it('call getTagsWithConditions with invalid searchText, less than 3 characters', async () => {
      const searchText = 't'
      const req = httpMocks.createRequest({
        query: { searchText },
        body: {
          userId: 1,
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      res.badRequest = jest.fn()
      await controller.getTagsWithConditions(req, res)
      expect(res.badRequest).toHaveBeenCalledTimes(1)
    })
    it('call getTagsWithConditions with invalid searchText, special characters', async () => {
      const searchText = '#$%'
      const req = httpMocks.createRequest({
        query: { searchText },
        body: {
          userId: 1,
        },
      })
      const res: any = httpMocks.createResponse()
      res.badRequest = jest.fn()
      await controller.getTagsWithConditions(req, res)
      expect(res.badRequest).toHaveBeenCalledTimes(1)
    })
    it('processes query with defaults', async () => {
      const req = createGetTagsRequestWithUser(undefined)
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result: string[] = []
      tagManagementService.getTagsWithConditions.mockResolvedValue(result)
      await controller.getTagsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(tagManagementService.getTagsWithConditions).toHaveBeenCalledWith({
        limit: 5,
        userId: 1,
        searchText: 'tag',
      })
    })
    it('processes query with searchText=tag1', async () => {
      const searchText = 'tag1'
      const req = httpMocks.createRequest({
        query: { searchText },
        body: {
          userId: 1,
        },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result: string[] = ['tag1', 'tag2']
      tagManagementService.getTagsWithConditions.mockResolvedValue(result)
      await controller.getTagsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(tagManagementService.getTagsWithConditions).toHaveBeenCalledWith(
        expect.objectContaining({ searchText }),
      )
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
        orderBy: 'updatedAt',
        sortDirection: 'desc',
        searchText: '',
        userId: 1,
        state: undefined,
        isFile: undefined,
        tags: [],
      })
    })

    it('processes query with specified parameters', async () => {
      const userId = 2
      const limit = 500
      const offset = 1
      const orderBy = 'clicks'
      const sortDirection = 'asc'
      const searchText = 'TEXT'
      const state = 'ACTIVE'
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
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith({
        limit,
        offset,
        orderBy,
        sortDirection,
        searchText: searchText.toLowerCase(),
        userId,
        state,
        isFile: undefined,
        tags: [],
      })
    })

    it('processes query with isFile=true', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'true' },
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
        query: { isFile: 'false' },
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

    it('processes query with empty tags', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'false', tags: '' },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith(
        expect.objectContaining({ isFile: false, tags: [] }),
      )
    })

    it('processes query with non empty tags', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'false', tags: 'tag1;tag2' },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.getUrlsWithConditions).toHaveBeenCalledWith(
        expect.objectContaining({ isFile: false, tags: ['tag1', 'tag2'] }),
      )
    })

    it('processes query with invalid tags-long', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'false', tags: '01234567890123456789012345;tag2' },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      res.badRequest = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.badRequest).toHaveBeenCalledTimes(1)
    })

    it('processes query with invalid tags-special character', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'false', tags: 'tag1^%^;tag2' },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      res.badRequest = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.badRequest).toHaveBeenCalledTimes(1)
    })

    it('processes query with more than 5 tags', async () => {
      const req = httpMocks.createRequest({
        body: { userId: 1 },
        query: { isFile: 'false', tags: 'tag1;tag2;tag3;tag4;tag5;tag6' },
      })
      const res: any = httpMocks.createResponse()
      res.ok = jest.fn()
      res.badRequest = jest.fn()
      const result = { urls: [], count: 0 }
      urlManagementService.getUrlsWithConditions.mockResolvedValue(result)

      await controller.getUrlsWithConditions(req, res)
      expect(res.badRequest).toHaveBeenCalledTimes(1)
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

  it('sends userMessage', async () => {
    const req = createRequestWithUser(undefined)
    const res = httpMocks.createResponse()
    const send = jest.spyOn(res, 'send')
    await controller.getUserMessage(req, res)
    expect(send).toHaveBeenCalledWith(userMessage)
  })

  it('sends userAnnouncement', async () => {
    const req = createRequestWithUser(undefined)
    const res = httpMocks.createResponse()
    const send = jest.spyOn(res, 'send')

    await controller.getUserAnnouncement(req, res)
    expect(send).toHaveBeenCalledWith(userAnnouncement)
  })
})
