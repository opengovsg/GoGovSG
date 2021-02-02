import httpMock from 'node-mocks-http'
import { SearchResultsSortOrder } from '../../../../shared/search'

import { logger } from '../../../../../test/server/config'

import { DirectoryController } from '..'

const searchResults = {
  urls: [
    {
      longUrl: 'https://test-moh.com',
      shortUrl: 'test-moh',
      state: 'ACTIVE',
      isFile: false,
      email: 'test@test.gov.sg',
    },
  ],
  count: 0,
}

const plainTextSearch = jest.fn()
const loggerErrorSpy = jest.spyOn(logger, 'error')

const controller = new DirectoryController({ plainTextSearch })

/**
 * Unit test for directory controller.
 */
describe('DirectoryController unit test', () => {
  beforeEach(() => {
    plainTextSearch.mockClear()
    loggerErrorSpy.mockClear()
    plainTextSearch.mockResolvedValue(searchResults)
  })
  it('should return directory search results from service', async () => {
    const req = httpMock.createRequest({
      query: {
        query: 'test@test.gov.sg',
        order: 'recency',
        limit: 10,
        offset: 0,
        state: 'ACTIVE',
        isFile: 'false',
        isEmail: 'true',
      },
    })
    const res: any = httpMock.createResponse()
    const okSpy = jest.fn()
    res.ok = okSpy
    await controller.getDirectoryWithConditions(req, res)
    const conditions = {
      query: 'test@test.gov.sg',
      order: SearchResultsSortOrder.Recency,
      limit: 10,
      offset: 0,
      state: 'ACTIVE',
      isFile: false,
      isEmail: true,
    }

    expect(plainTextSearch).toBeCalledWith(conditions)
    expect(okSpy).toHaveBeenCalledWith(searchResults)
  })

  it('should work with without isfile and state', async () => {
    const req = httpMock.createRequest({
      query: {
        query: 'test@test.gov.sg',
        order: 'recency',
        limit: 10,
        offset: 0,
        state: '',
        isFile: '',
        isEmail: 'true',
      },
    })
    const res: any = httpMock.createResponse()
    const okSpy = jest.fn()
    res.ok = okSpy
    await controller.getDirectoryWithConditions(req, res)
    const conditions = {
      query: 'test@test.gov.sg',
      order: SearchResultsSortOrder.Recency,
      limit: 10,
      offset: 0,
      state: '',
      isFile: undefined,
      isEmail: true,
    }

    expect(plainTextSearch).toBeCalledWith(conditions)
    expect(okSpy).toHaveBeenCalledWith(searchResults)
  })

  it('should respond with server error and log the error when service throws', async () => {
    const req = httpMock.createRequest({
      query: {
        query: 'test@test.gov.sg',
        order: 'recency',
        limit: 10,
        offset: 0,
        state: '',
        isFile: '',
        isEmail: 'true',
      },
    })
    const res: any = httpMock.createResponse()
    const serverErrorSpy = jest.fn()
    res.serverError = serverErrorSpy
    plainTextSearch.mockRejectedValue(new Error('Service error'))
    await controller.getDirectoryWithConditions(req, res)
    expect(res.serverError).toHaveBeenCalled()
    const conditions = {
      query: 'test@test.gov.sg',
      order: SearchResultsSortOrder.Recency,
      limit: 10,
      offset: 0,
      state: '',
      isFile: undefined,
      isEmail: true,
    }
    expect(plainTextSearch).toBeCalledWith(conditions)
    expect(logger.error).toBeCalled()
  })
})
