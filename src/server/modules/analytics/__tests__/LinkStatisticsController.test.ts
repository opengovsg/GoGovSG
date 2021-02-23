import httpMocks from 'node-mocks-http'

import { createRequestWithShortUrl } from '../../../../../test/server/api/util'
import { UserType } from '../../../models/user'
import { UrlType } from '../../../models/url'

import { LinkStatisticsController } from '..'

const getLinkStatistics = jest.fn()
const updateLinkStatistics = jest.fn()
getLinkStatistics.mockResolvedValue({
  totalClicks: 1,
  deviceClicks: {
    desktop: 1,
    tablet: 2,
    mobile: 3,
    others: 4,
  },
  dailyClicks: [],
  weekdayClicks: [],
})

const controller = new LinkStatisticsController({
  getLinkStatistics,
  updateLinkStatistics,
})
const userCredentials = {
  id: 1,
  email: 'hello@open.gov.sg',
  Urls: [{ shortUrl: 'test' } as UrlType],
} as UserType

describe('LinkStatisticsController test', () => {
  test('no short url included', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(404)
  })

  test('authenticated user with no short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.session!.user = userCredentials

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(404)
  })

  test('unauthenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(401)
  })

  test('authenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).toBeCalledWith(
      userCredentials.id,
      'test',
      undefined,
    )
    expect(responseSpy).toBeCalledWith(200)
  })

  test('authenticated user with short url and offset', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.query.offset = '3650'
    req.session!.user = userCredentials

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).toBeCalledWith(userCredentials.id, 'test', 3650)
    expect(responseSpy).toBeCalledWith(200)
  })

  test('LinkStatisticsService throws error', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    getLinkStatistics.mockRejectedValue(new Error(':('))

    await controller.getLinkStatistics(req, res)
    expect(getLinkStatistics).toBeCalledWith(
      userCredentials.id,
      'test',
      undefined,
    )
    expect(responseSpy).toBeCalledWith(404)
  })
})
