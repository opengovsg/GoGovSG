import httpMock from 'node-mocks-http'
import { DirectoryController } from '../../../src/server/controllers/DirectoryController'
import { DirectorySearchServiceMock } from '../mocks/services/DirectorySearchService'
import { logger } from '../config'
import { SearchResultsSortOrder } from '../../../src/shared/search'

const directorySearchService = new DirectorySearchServiceMock()
const controller = new DirectoryController(directorySearchService)
const searchSpy = jest.spyOn(directorySearchService, 'plainTextSearch')
const loggerErrorSpy = jest.spyOn(logger, 'error')

/**
 * Unit test for directory controller.
 */
describe('DirectoryController unit test', () => {
  beforeEach(() => {
    searchSpy.mockClear()
    loggerErrorSpy.mockClear()
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

    expect(directorySearchService.plainTextSearch).toBeCalledWith(conditions)
    expect(okSpy).toHaveBeenCalled()
    expect(okSpy).toHaveBeenCalledWith({
      urls: [
        {
          shortUrl: 'test-moh',
          state: 'ACTIVE',
          isFile: false,
          email: 'test@test.gov.sg',
        },
      ],
      count: 0,
    })
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

    expect(directorySearchService.plainTextSearch).toBeCalledWith(conditions)
    expect(okSpy).toHaveBeenCalled()
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
    searchSpy.mockImplementationOnce(() => {
      throw new Error('Service error')
    })
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
    expect(directorySearchService.plainTextSearch).toBeCalledWith(conditions)
    expect(logger.error).toBeCalled()
  })
})
