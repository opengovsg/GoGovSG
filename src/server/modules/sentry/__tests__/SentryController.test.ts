import httpMocks from 'node-mocks-http'
import { SentryController } from '../SentryController'

describe('SentryController tests', () => {
  it('Should return rotating links defined in the application configurations', () => {
    const controller = new SentryController()
    const { req, res } = httpMocks.createMocks()
    jest.spyOn(res, 'send')
    controller.getSentryDns(req, res)

    expect(res.send).toBeCalledWith('mocksentry.com')
  })
})
