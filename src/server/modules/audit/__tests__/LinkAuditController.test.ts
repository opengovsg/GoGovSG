import httpMocks from 'node-mocks-http'

import { createRequestWithShortUrl } from '../../../../../test/server/api/util'
import { UserType } from '../../../models/user'
import { UrlType } from '../../../models/url'
import { NotFoundError } from '../../../util/error'

import { LinkAuditController } from '..'

const getLinkAudit = jest.fn()
const getChangeSets = jest.fn()
const computeInitialChangeSet = jest.fn()
const computePairwiseChangeSet = jest.fn()
getLinkAudit.mockResolvedValue({
  changes: [
    {
      type: 'update',
      key: 'state',
      prevValue: 'ACTIVE',
      currValue: 'INACTIVE',
      updatedAt: '2022-08-05T11:57:38.417Z',
    },
    {
      type: 'create',
      key: 'longUrl',
      prevValue: '',
      currValue: 'https://abc.com',
      updatedAt: '2022-05-30T04:45:55.204Z',
    },
  ],
  limit: 10,
  offset: 10,
  totalCount: 12,
})

const controller = new LinkAuditController({
  getLinkAudit,
  getChangeSets,
  computeInitialChangeSet,
  computePairwiseChangeSet,
})
const userCredentials = {
  id: 1,
  email: 'hello@open.gov.sg',
  Urls: [{ shortUrl: 'test' } as UrlType],
} as UserType

describe('LinkAuditController test', () => {
  test('no short url included', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(404)
  })

  test('authenticated user with no short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.session!.user = userCredentials

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(404)
  })

  test('unauthenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).not.toHaveBeenCalled()
    expect(responseSpy).toBeCalledWith(401)
  })

  test('authenticated user with short url', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).toBeCalledWith(
      userCredentials.id,
      'test',
      undefined,
      undefined,
    )
    expect(responseSpy).toBeCalledWith(200)
  })

  test('authenticated user with short url, limit and offset', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.query.offset = '10'
    req.query.limit = '10'
    req.session!.user = userCredentials

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).toBeCalledWith(userCredentials.id, 'test', 10, 10)
    expect(responseSpy).toBeCalledWith(200)
  })

  test('LinkAuditService throws error for invalid limit or offset', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    getLinkAudit.mockRejectedValue(new Error(':('))

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).toBeCalledWith(
      userCredentials.id,
      'test',
      undefined,
      undefined,
    )
    expect(responseSpy).toBeCalledWith(400)
  })

  test('LinkAuditService throws NotFoundError', async () => {
    const req = createRequestWithShortUrl('')
    const res = httpMocks.createResponse()
    const responseSpy = jest.spyOn(res, 'status')
    req.query.url = 'test'
    req.session!.user = userCredentials

    getLinkAudit.mockRejectedValue(new NotFoundError(':('))

    await controller.getLinkAudit(req, res)
    expect(getLinkAudit).toBeCalledWith(
      userCredentials.id,
      'test',
      undefined,
      undefined,
    )
    expect(responseSpy).toBeCalledWith(404)
  })
})
