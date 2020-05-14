import 'reflect-metadata'
import { spy } from 'sinon'
import { urlModelMock } from '../util'
import { NotFoundError } from '../../../../src/server/util/error'
import { logger } from '../../config'
import { UrlRepositorySequelize } from '../../../../src/server/api/repositories/url'

jest.mock('../../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../../src/server/config', () => ({
  logger,
}))

const urlRepo = new UrlRepositorySequelize()
const incrementSpy = spy()

/**
 * A mock of sequelize models' findOne method. If the short url is 'a',
 * then an instance with a spy function will be returned.
 * @param  {any} params FindOne parameters.
 * @returns Promise containing the instance.
 */
async function mockFindOne(params: any): Promise<any> {
  if (params.where.shortUrl === 'a') {
    return Promise.resolve({
      increment: incrementSpy,
    })
  }
  return Promise.resolve(null)
}

describe('url repository sequelize implementation tests', () => {
  beforeEach(() => {
    incrementSpy.resetHistory()
  })

  test('get existing short url', async () => {
    await expect(urlRepo.getLongUrlFromDatabase('a')).resolves.toBe('aa')
  })

  test('get non-existant url throw NotFoundError', async () => {
    jest
      .spyOn(urlModelMock, 'findOne')
      .mockReturnValueOnce(Promise.resolve(null))
    await expect(urlRepo.getLongUrlFromDatabase('aaaaa')).rejects.toThrow(
      NotFoundError,
    )
  })

  test('increment clicks on existing url', async () => {
    jest.spyOn(urlModelMock, 'findOne').mockImplementationOnce(mockFindOne)
    await urlRepo.incrementClick('a')
    expect(incrementSpy.calledOnceWithExactly('clicks')).toBeTruthy()
  })

  test('increment clicks on non-existant url', async () => {
    jest.spyOn(urlModelMock, 'findOne').mockImplementationOnce(mockFindOne)
    await urlRepo.incrementClick('aa')
    expect(incrementSpy.notCalled).toBeTruthy()
  })
})
