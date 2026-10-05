import httpMocks from 'node-mocks-http'
import { LogoutController } from '..'

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
    expect(okSpy).toHaveBeenCalledWith(
      expect.objectContaining({ oneGovSg: false }),
    )
  })

  it('should report a one.gov.sg session', () => {
    const okSpy = jest.fn()
    const req = httpMocks.createRequest({
      session: {
        oneGovSg: true,
        destroy: (onDestroy: () => void) => onDestroy(),
      },
    })
    const res: any = httpMocks.createResponse()
    res.ok = okSpy
    controller.logOut(req, res)
    expect(okSpy).toHaveBeenCalledWith(
      expect.objectContaining({ oneGovSg: true }),
    )
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
