import httpMocks from 'node-mocks-http'
import { RotatingLinksController } from '../RotatingLinksController'

describe('RotatingLinksController tests', () => {
  const linksToRotate = 'testlink1,testlink2,testlink3'
  const controller = new RotatingLinksController(linksToRotate)
  it('Should return rotating links defined in the application configurations', () => {
    const { req, res } = httpMocks.createMocks()
    jest.spyOn(res, 'send')
    controller.getRotatingLinks(req, res)

    expect(res.send).toBeCalledWith(linksToRotate)
  })
})
