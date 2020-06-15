import httpMocks from 'node-mocks-http'
import { RotatingLinksController } from '../../../src/server/controllers/RotatingLinksController'

describe('RotatingLinksController tests', () => {
  it('Should return rotating links defined in the application configurations', () => {
    const controller = new RotatingLinksController()
    const { req, res } = httpMocks.createMocks()
    jest.spyOn(res, 'send')
    controller.getRotatingLinks(req, res)

    expect(res.send).toBeCalledWith('testlink1,testlink2,testlink3')
  })
})
