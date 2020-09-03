import httpMocks from 'node-mocks-http'

import { StatisticsController } from '../../../src/server/controllers/StatisticsController'

describe('StatisticsController test', () => {
  const getGlobalStatistics = jest.fn()
  const controller = new StatisticsController({ getGlobalStatistics })

  it('gets global statistics', async () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()
    await controller.getGlobalStatistics(req, res)

    expect(getGlobalStatistics).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
