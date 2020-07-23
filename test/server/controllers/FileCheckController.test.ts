import httpMocks from 'node-mocks-http'

import { FileCheckController } from '../../../src/server/controllers/FileCheckController'
import { VirusScanServiceInterface } from '../../../src/server/services/interfaces/VirusScanServiceInterface'
import { createRequestWithFile } from '../api/util'

describe('FileCheckController test', () => {
  const file = { data: Buffer.from('data'), name: 'file.csv' }
  const hasVirus = jest.fn()
  const service: VirusScanServiceInterface = { hasVirus }

  const controller = new FileCheckController(service)
  const badRequest = jest.fn()

  beforeEach(() => {
    hasVirus.mockClear()
    badRequest.mockClear()
  })

  it('does not invoke checks if no files', async () => {
    const req = createRequestWithFile(undefined)
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await controller.checkFile(req, res, next)
    res.on('end', async () => {
      expect(hasVirus).not.toHaveBeenCalled()
    })
    expect(next).toHaveBeenCalled()
  })

  it('does not accept file array', async () => {
    const req = createRequestWithFile([])
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    res.badRequest = badRequest

    await controller.checkFile(req, res, next)

    expect(hasVirus).not.toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('returns server error on virus scan failure', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    hasVirus.mockRejectedValue(false)
    res.serverError = badRequest

    await controller.checkFile(req, res, next)

    expect(hasVirus).toHaveBeenCalled()
    expect(res.serverError).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('returns bad request on virulent file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    hasVirus.mockResolvedValue(true)
    res.badRequest = badRequest

    await controller.checkFile(req, res, next)

    expect(hasVirus).toHaveBeenCalled()
    expect(res.badRequest).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('passes through on good file', async () => {
    const req = createRequestWithFile(file)
    const res = httpMocks.createResponse() as any
    const next = jest.fn()

    hasVirus.mockResolvedValue(false)
    res.badRequest = badRequest
    res.serverError = badRequest

    await controller.checkFile(req, res, next)

    expect(hasVirus).toHaveBeenCalled()
    expect(badRequest).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
