import redisMock from 'redis-mock'
import { SafeBrowsingMapper } from '../../mappers/SafeBrowsingMapper'

const redisMockClient = redisMock.createClient()

jest.mock('../../../../redis', () => ({
  safeBrowsingClient: redisMockClient,
}))

const setSpy = jest.spyOn(redisMockClient, 'set')
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
    await new Promise<void>((resolve) => {
      redisMockClient.flushall(() => resolve())
    })
    setSpy.mockClear()
    getSpy.mockClear()
  })

  it('returns a value if present', async () => {
    redisMockClient.set(url, JSON.stringify(threat))
    await expect(repository.get(url)).resolves.toStrictEqual(threat)
    expect(redisMockClient.get).toBeCalledWith(url, expect.any(Function))
  })

  it('returns null if absent', async () => {
    await expect(repository.get(url)).resolves.toBeNull()
    expect(redisMockClient.get).toBeCalledWith(url, expect.any(Function))
  })

  it('sets a value if specified', async () => {
    await repository.set(url, threat)
    expect(redisMockClient.set).toBeCalledWith(
      url,
      JSON.stringify(threat),
      'EX',
      durationInSeconds,
      expect.any(Function),
    )
  })

  it('throws if no matches', async () => {
    const originalSet = redisMockClient.set
    redisMockClient.set = () => {
      throw Error()
    }
    await expect(repository.set(url, [])).rejects.toThrowError()
    redisMockClient.set = originalSet
  })
})
