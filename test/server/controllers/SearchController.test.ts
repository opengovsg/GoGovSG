import httpMock from 'node-mocks-http'
import sinon from 'sinon'
import { SearchController } from '../../../src/server/controllers/SearchController'
import { UrlSearchServiceMock } from '../mocks/services/UrlSearchService'
import { logger } from '../config'
import { SearchResultsSortOrder } from '../../../src/shared/search'

const urlSearchService = new UrlSearchServiceMock()
const controller = new SearchController(urlSearchService)
const searchSpy = jest.spyOn(urlSearchService, 'plainTextSearch')
const loggerErrorSpy = jest.spyOn(logger, 'error')

/**
 * Unit test for search controller.
 */
describe('SearchController unit test', () => {
  beforeEach(() => {
    searchSpy.mockClear()
    loggerErrorSpy.mockClear()
  })
  it('should return search results from service', async () => {
    const okSpy = sinon.fake()
    const req = httpMock.createRequest({
      query: {
        query: 'moh',
        order: 'relevance',
        limit: 10,
        offset: 0,
      },
    })
    const res = httpMock.createResponse() as any
    res.ok = okSpy
    await controller.urlSearchPlainText(req, res)
    expect(res.ok.called).toBeTruthy()
    expect(urlSearchService.plainTextSearch).toBeCalledWith(
      'moh',
      SearchResultsSortOrder.Relevance,
      10,
      0,
    )
    // clicks information should be stripped
    expect(res.ok.lastCall.args[0]).toStrictEqual({
      urls: [
        {
          shortUrl: 'test-moh',
          longUrl: 'https://www.moh.gov.sg/covid-19',
          state: 'ACTIVE',
          isFile: false,
          createdAt: '2020-04-17T09:10:07.491Z',
          updatedAt: '2020-06-09T10:07:07.557Z',
          description: '',
          contactEmail: null,
        },
      ],
      // Respects count returned from service.
      count: 0,
    })
  })

  it('should work with default limit and offset', async () => {
    const okSpy = sinon.fake()
    const req = httpMock.createRequest({
      query: {
        query: 'moh',
        order: 'relevance',
      },
    })
    const res = httpMock.createResponse() as any
    res.ok = okSpy
    await controller.urlSearchPlainText(req, res)
    expect(res.ok.called).toBeTruthy()
    expect(urlSearchService.plainTextSearch).toBeCalledWith(
      'moh',
      SearchResultsSortOrder.Relevance,
      100,
      0,
    )
    // clicks information should be stripped
    expect(res.ok.lastCall.args[0]).toStrictEqual({
      urls: [
        {
          shortUrl: 'test-moh',
          longUrl: 'https://www.moh.gov.sg/covid-19',
          state: 'ACTIVE',
          isFile: false,
          createdAt: '2020-04-17T09:10:07.491Z',
          updatedAt: '2020-06-09T10:07:07.557Z',
          description: '',
          contactEmail: null,
        },
      ],
      count: 0,
    })
  })

  it('should respond with server error and log the error when service throws', async () => {
    const serverErrorSpy = sinon.fake()
    const req = httpMock.createRequest({
      query: {
        query: 'moh',
        order: 'relevance',
        limit: 10,
        offset: 0,
      },
    })
    const res = httpMock.createResponse() as any
    res.serverError = serverErrorSpy
    searchSpy.mockImplementationOnce(() => {
      throw new Error('Service error')
    })
    await controller.urlSearchPlainText(req, res)
    expect(res.serverError.called).toBeTruthy()
    expect(urlSearchService.plainTextSearch).toBeCalledWith(
      'moh',
      SearchResultsSortOrder.Relevance,
      10,
      0,
    )
    expect(logger.error).toBeCalled()
  })
})
