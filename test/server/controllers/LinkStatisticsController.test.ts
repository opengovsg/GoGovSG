import httpMocks from 'node-mocks-http'

import { LinkStatisticsController } from '../../../src/server/controllers/LinkStatisticsController'
import { LinkStatisticsServiceMock } from '../mocks/services/LinkStatisticsService'
import { createRequestWithShortUrl } from '../api/util'
import { UserType } from '../../../src/server/models/user'
import { UrlType } from '../../../src/server/models/url'

const service = new LinkStatisticsServiceMock()
const controller = new LinkStatisticsController(service)
const userCredentials = {
  id: 1,
  email: 'hello@open.gov.sg',
  Urls: [{ shortUrl: 'test' } as UrlType],
} as UserType

describe('LinkStatisticsController test', () => {
  const serviceSpy = jest.spyOn(service, 'getLinkStatistics')

  test('no short url included', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')

    res.on('end', async () => {
      await controller.getLinkStatistics(req, res)
      expect(serviceSpy).not.toHaveBeenCalled()
      expect(responseSpy).toBeCalledWith(404)
    })
  })

  test('authenticated user with no short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.session!.user = userCredentials

    res.on('end', async () => {
      await controller.getLinkStatistics(req, res)
      expect(serviceSpy).not.toHaveBeenCalled()
      expect(responseSpy).toBeCalledWith(404)
    })
  })

  test('unauthenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'

    res.on('end', async () => {
      await controller.getLinkStatistics(req, res)
      expect(serviceSpy).not.toHaveBeenCalled()
      expect(responseSpy).toBeCalledWith(401)
    })
  })

  test('authenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    res.on('end', async () => {
      await controller.getLinkStatistics(req, res)
      expect(serviceSpy).toBeCalledWith(userCredentials.id, 'test')
      expect(responseSpy).toBeCalledWith(200)
    })
  })

  test('LinkStatisticsService throws error', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    serviceSpy.mockImplementationOnce((_, __) => {
      throw Error(':(')
    })

    res.on('end', async () => {
      await controller.getLinkStatistics(req, res)
      expect(serviceSpy).toBeCalledWith(userCredentials.id, 'test')
      expect(responseSpy).toBeCalledWith(404)
    })
  })
})
