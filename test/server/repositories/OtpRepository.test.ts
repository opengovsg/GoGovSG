import { redisMockClient } from '../api/util'
import { OtpRepository } from '../../../src/server/repositories/OtpRepository'
import { OtpMapper } from '../../../src/server/mappers/OtpMapper'

jest.mock('../../../src/server/redis', () => ({
  otpClient: redisMockClient,
}))

const setSpy = jest.spyOn(redisMockClient, 'set')
const getSpy = jest.spyOn(redisMockClient, 'get')
const delSpy = jest.spyOn(redisMockClient, 'del')
const cache = new OtpRepository(new OtpMapper())
const otp = {
  hashedOtp: 'aaa',
  retries: 1000,
}

describe('otp cache redis test', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      redisMockClient.flushall(() => resolve())
    })
  })

  afterEach(() => {
    setSpy.mockClear()
    getSpy.mockClear()
    delSpy.mockClear()
  })

  test('deleteOtpByEmail test', async () => {
    redisMockClient.set('aaa@aa.com', 'aa')
    await cache.deleteOtpByEmail('aaa@aa.com')
    expect(redisMockClient.del).toBeCalledTimes(1)
    expect(redisMockClient.del).toBeCalledWith(
      'aaa@aa.com',
      expect.any(Function),
    )
  })

  test('getOtpByEmail test', async () => {
    redisMockClient.set('aaa@aa.com', JSON.stringify(otp))
    await expect(cache.getOtpForEmail('aaa@aa.com')).resolves.toStrictEqual(otp)
    expect(redisMockClient.get).toBeCalledWith(
      'aaa@aa.com',
      expect.any(Function),
    )
  })

  test('getOtpByEmail null test', async () => {
    await expect(cache.getOtpForEmail('aaa@aa.com')).resolves.toStrictEqual(
      null,
    )
    expect(redisMockClient.get).toBeCalledWith(
      'aaa@aa.com',
      expect.any(Function),
    )
  })

  test('getOtpByEmail throws test', async () => {
    const originalGet = redisMockClient.get
    redisMockClient.get = (_, callback) => {
      if (callback == null) {
        return false
      }
      callback(Error(), '')
      return true
    }
    redisMockClient.set('aaa@aa.com', JSON.stringify(otp))
    await expect(cache.getOtpForEmail('aaa@aa.com')).rejects.toThrowError()
    redisMockClient.get = originalGet
  })

  test('setOtpByEmail test', async () => {
    await cache.setOtpForEmail('aaa@aa.com', otp)
    expect(redisMockClient.set).toBeCalledWith(
      'aaa@aa.com',
      JSON.stringify(otp),
      'EX',
      10,
      expect.any(Function),
    )
  })

  test('setOtpByEmail throws test', async () => {
    const originalSet = redisMockClient.set
    redisMockClient.set = () => {
      throw Error()
    }
    await expect(cache.setOtpForEmail('aaa@aa.com', otp)).rejects.toThrowError()
    redisMockClient.set = originalSet
  })
})
