import httpMocks from 'node-mocks-http'
import { LogoutController } from '../../../src/server/controllers/LogoutController'

describe('LogoutController', () => {
  const controller = new LogoutController()
  it('should destroy session', () => {
    const destroySpy = jest.fn()
    destroySpy.mockImplementation((onDestroy) => onDestroy())
    const okSpy = jest.fn()
    const req = httpMocks.createRequest({
      session: {
        destroy: destroySpy,
      },
    })
    const res: any = httpMocks.createResponse()
    res.ok = okSpy
    controller.logOut(req, res)
    expect(destroySpy).toHaveBeenCalled()
    expect(okSpy).toHaveBeenCalled()
  })

  it('should send server error when no session', () => {
    const serverErrorSpy = jest.fn()
    const okSpy = jest.fn()
    const req = httpMocks.createRequest()
    const res: any = httpMocks.createResponse()
    res.serverError = serverErrorSpy
    res.ok = okSpy
    controller.logOut(req, res)
    expect(serverErrorSpy).toHaveBeenCalled()
    expect(okSpy).not.toHaveBeenCalled()
  })
})
