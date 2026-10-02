import { createRedisClientMock } from '../../../../../../test/server/mocks/services/RedisClient'
import { SafeBrowsingMapper } from '../../mappers/SafeBrowsingMapper'

const redisMockClient = createRedisClientMock()

jest.mock('../../../../redis', () => ({
  safeBrowsingClient: redisMockClient,
}))

const setSpy = jest.spyOn(redisMockClient, 'setEx')
const getSpy = jest.spyOn(redisMockClient, 'get')

const { SafeBrowsingRepository } = require('..')

const repository = new SafeBrowsingRepository(new SafeBrowsingMapper())

const durationInSeconds = 300
const url = 'https://example.com'
const threat = {
  threatTypes: ['MALWARE'],
  expireTime: '2024-03-20T05:29:41.898456500Z',
}

describe('safe browsing repository redis test', () => {
  beforeEach(async () => {
    await redisMockClient.flushAll()
    setSpy.mockClear()
    getSpy.mockClear()
  })

  it('returns a value if present', async () => {
    await redisMockClient.set(url, JSON.stringify(threat))
    await expect(repository.get(url)).resolves.toStrictEqual(threat)
    expect(redisMockClient.get).toHaveBeenCalledWith(url)
  })

  it('returns null if absent', async () => {
    await expect(repository.get(url)).resolves.toBeNull()
    expect(redisMockClient.get).toHaveBeenCalledWith(url)
  })

  it('sets a value if specified', async () => {
    await repository.set(url, threat)
    expect(redisMockClient.setEx).toHaveBeenCalledWith(
      url,
      durationInSeconds,
      JSON.stringify(threat),
    )
  })

  it('throws if no matches', async () => {
    setSpy.mockRejectedValueOnce(new Error())
    await expect(repository.set(url, [])).rejects.toThrow()
  })
})
