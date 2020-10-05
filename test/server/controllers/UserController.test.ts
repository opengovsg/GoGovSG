/* eslint-disable global-require */
import httpMocks from 'node-mocks-http'
import { StorableUrlState } from '../../../src/server/repositories/enums'
import { createRequestWithUser } from '../api/util'

import { UserController } from '../../../src/server/controllers/UserController'

const urlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
}

const userMessage = 'The quick brown fox jumps over a lazy dog'

describe('UserController', () => {
  const controller = new UserController(urlManagementService, userMessage)

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
      urlManagementService.createUrl.mockResolvedValue(result)

      await controller.createUrl(req, res)
      expect(res.ok).toHaveBeenCalledWith(result)
      expect(urlManagementService.createUrl).toHaveBeenCalledWith(
        userId,
        shortUrl,
        longUrl,
        undefined,
      )
    })

    it('reports bad request on Error', async () => {
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
    const isSearchable = true
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
          isSearchable,
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
          isSearchable,
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
          isSearchable,
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
          isSearchable,
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
          isSearchable,
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
          isSearchable,
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

  describe('getUrlsWithConditions', () => {
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
        userId: undefined,
        state: undefined,
        isFile: undefined,
      })
    })

    it('processes query with specified parameters', async () => {
      const userId = 2
      const limit = 500
      const offset = 1
      const orderBy = 'popularity'
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
      })
    })

    it('processes query with isFile=true', async () => {
      const req = httpMocks.createRequest({
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
})
