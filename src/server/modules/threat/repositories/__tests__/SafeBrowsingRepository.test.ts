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

const durationInSeconds = 1
const url = 'https://example.com'
const matches = [
  {
    cacheDuration: `${durationInSeconds}s`,
  },
]

describe('otp repository redis test', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      redisMockClient.flushall(() => resolve())
    })
    setSpy.mockClear()
    getSpy.mockClear()
  })

  it('returns a value if present', async () => {
    redisMockClient.set(url, JSON.stringify(matches))
    await expect(repository.get(url)).resolves.toStrictEqual(matches)
    expect(redisMockClient.get).toBeCalledWith(url, expect.any(Function))
  })

  it('returns null if absent', async () => {
    await expect(repository.get(url)).resolves.toBeNull()
    expect(redisMockClient.get).toBeCalledWith(url, expect.any(Function))
  })

  it('sets a value if specified', async () => {
    await repository.set(url, matches)
    expect(redisMockClient.set).toBeCalledWith(
      url,
      JSON.stringify(matches),
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
