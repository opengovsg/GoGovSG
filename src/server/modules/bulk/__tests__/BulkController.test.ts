import httpMocks from 'node-mocks-http'
import express from 'express'

import { BulkController } from '..'
import { createRequestWithFile } from '../../threat/__tests__/FileCheckController.test'

const mockBulkService = {
  parseCsv: jest.fn(),
  generateUrlMappings: jest.fn(),
}
const mockUrlManagementService = {
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  bulkCreate: jest.fn(),
}

const controller = new BulkController(mockBulkService, mockUrlManagementService)

describe('BulkController unit test', () => {
  describe('validateAndParseCsv tests', () => {
    const badRequest = jest.fn()
    const ok = jest.fn()

    beforeEach(() => {
      badRequest.mockClear()
      ok.mockClear()
    })

    it('validateAndParseCsv responds with error if no csv is found', async () => {
      const req = createRequestWithFile(undefined)
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest

      await controller.validateAndParseCsv(req, res, next)

      expect(mockBulkService.parseCsv).not.toHaveBeenCalled()
      expect(res.badRequest).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('validateAndParseCsv responds with error if csv is invalid', async () => {
      const invalidFile = { data: Buffer.from('Original'), name: 'file.blah' }
      const req = createRequestWithFile(invalidFile)
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest
      mockBulkService.parseCsv.mockReturnValue({ isValid: false })

      await controller.validateAndParseCsv(req, res, next)

      expect(mockBulkService.parseCsv).toHaveBeenCalled()
      expect(res.badRequest).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('validateAndParseCsv should add longUrls to request body if csv is valid', async () => {
      const file = { data: Buffer.from('data'), name: 'file.csv' }
      const req = createRequestWithFile(file) as any
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction
      const longUrls = ['https://google.com']

      res.badRequest = badRequest
      mockBulkService.parseCsv.mockReturnValue({ isValid: true, longUrls })

      await controller.validateAndParseCsv(req, res, next)

      expect(mockBulkService.parseCsv).toHaveBeenCalled()
      expect(req.body.longUrls).toEqual(longUrls)
      expect(res.badRequest).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('bulkCreate tests', () => {
    const badRequest = jest.fn()
    const ok = jest.fn()

    beforeEach(() => {
      badRequest.mockClear()
      ok.mockClear()
    })

    it('bulkCreate without tags should return success if urls are created', async () => {
      const userId = 1
      const longUrl = 'https://google.com'
      const urlMappings = [
        {
          shortUrl: 'n2io3n12',
          longUrl,
        },
      ]

      const req = httpMocks.createRequest({
        body: { userId, longUrls: [longUrl] },
      })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest
      res.ok = ok
      mockBulkService.generateUrlMappings.mockResolvedValue(urlMappings)
      mockUrlManagementService.bulkCreate.mockResolvedValue({})

      await controller.bulkCreate(req, res, next)

      expect(mockBulkService.generateUrlMappings).toHaveBeenCalled()
      expect(mockUrlManagementService.bulkCreate).toHaveBeenCalledWith(
        userId,
        urlMappings,
        undefined,
      )
      expect(res.badRequest).not.toHaveBeenCalled()
      expect(res.ok).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('bulkCreate without tags responds with error if urls are not created', async () => {
      const userId = 1
      const longUrl = 'https://google.com'
      const urlMapping = {
        shortUrl: 'n2io3n12',
        longUrl,
      }
      const urlMappings = [urlMapping, urlMapping]
      const longUrls = [longUrl, longUrl]

      const req = httpMocks.createRequest({ body: { userId, longUrls } })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest
      res.ok = ok
      mockBulkService.generateUrlMappings.mockResolvedValue(urlMappings)
      mockUrlManagementService.bulkCreate.mockRejectedValue({})

      await controller.bulkCreate(req, res, next)

      expect(mockBulkService.generateUrlMappings).toHaveBeenCalled()
      expect(mockUrlManagementService.bulkCreate).toHaveBeenCalledWith(
        userId,
        urlMappings,
        undefined,
      )
      expect(res.badRequest).toHaveBeenCalled()
      expect(res.ok).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('bulkCreate with tags should return success if urls are created', async () => {
      const userId = 1
      const longUrl = 'https://google.com'
      const urlMappings = [
        {
          shortUrl: 'n2io3n12',
          longUrl,
        },
      ]
      const tags = ['a', 'b']

      const req = httpMocks.createRequest({
        body: { userId, longUrls: [longUrl], tags },
      })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest
      res.ok = ok
      mockBulkService.generateUrlMappings.mockResolvedValue(urlMappings)
      mockUrlManagementService.bulkCreate.mockResolvedValue({})

      await controller.bulkCreate(req, res, next)

      expect(mockBulkService.generateUrlMappings).toHaveBeenCalled()
      expect(mockUrlManagementService.bulkCreate).toHaveBeenCalledWith(
        userId,
        urlMappings,
        tags,
      )
      expect(res.badRequest).not.toHaveBeenCalled()
      expect(res.ok).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('bulkCreate with tags responds with error if urls are not created', async () => {
      const userId = 1
      const longUrl = 'https://google.com'
      const urlMapping = {
        shortUrl: 'n2io3n12',
        longUrl,
      }
      const urlMappings = [urlMapping, urlMapping]
      const longUrls = [longUrl, longUrl]
      const tags = ['a', 'b']

      const req = httpMocks.createRequest({ body: { userId, longUrls, tags } })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction

      res.badRequest = badRequest
      res.ok = ok
      mockBulkService.generateUrlMappings.mockResolvedValue(urlMappings)
      mockUrlManagementService.bulkCreate.mockRejectedValue({})

      await controller.bulkCreate(req, res, next)

      expect(mockBulkService.generateUrlMappings).toHaveBeenCalled()
      expect(mockUrlManagementService.bulkCreate).toHaveBeenCalledWith(
        userId,
        urlMappings,
        tags,
      )
      expect(res.badRequest).toHaveBeenCalled()
      expect(res.ok).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })
  })
})
