import {
  clicksModelMock,
  devicesModelMock,
  heatMapModelMock,
  mockTransaction,
  redisMockClient,
  urlModelMock,
} from '../api/util'
import { S3InterfaceMock } from '../mocks/services/aws'
import { UrlRepository } from '../../../src/server/repositories/UrlRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

jest.mock('../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

jest.mock('../../../src/server/util/sequelize', () => ({
  transaction: mockTransaction,
}))

const repository = new UrlRepository(new S3InterfaceMock(), new UrlMapper())
const cacheGetSpy = jest.spyOn(redisMockClient, 'get')

describe('UrlRepository tests', () => {
  beforeEach(async () => {
    redisMockClient.flushall()
    cacheGetSpy.mockClear()
  })
  describe('getLongUrl tests', () => {
    it('should return from db when cache is empty', async () => {
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })

    it('should return from cache when cache is filled', async () => {
      redisMockClient.set('a', 'aaa')
      await expect(repository.getLongUrl('a')).resolves.toBe('aaa')
    })

    it('should return from db when cache is down', async () => {
      cacheGetSpy.mockImplementationOnce((_, callback) => {
        if (!callback) {
          return false
        }
        callback(new Error('Cache down'), 'Error')
        return false
      })
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })
  })
})
