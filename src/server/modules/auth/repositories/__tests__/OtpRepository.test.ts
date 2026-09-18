import { OtpMapper } from '../../../../mappers/OtpMapper'
import { redisMockClient } from '../../../../../../test/server/api/util'

jest.mock('../../../../redis', () => ({
  otpClient: redisMockClient,
}))

const setSpy = jest.spyOn(redisMockClient, 'set')
const getSpy = jest.spyOn(redisMockClient, 'get')
const delSpy = jest.spyOn(redisMockClient, 'del')

const { OtpRepository } = require('../OtpRepository')

const cache = new OtpRepository(new OtpMapper())
const otp = {
  hashedOtp: 'aaa',
  retries: 1000,
}
const email = 'aaa@aa.com'
const ip = '1.1.1.1'

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
    // Arrange
    const key = `${email}:${ip}`
    redisMockClient.set(key, 'aa')

    // Act
    await cache.deleteOtpByEmail(email, ip)

    // Assert
    expect(redisMockClient.del).toHaveBeenCalledTimes(1)
    expect(redisMockClient.del).toHaveBeenCalledWith(key, expect.any(Function))
  })

  test('getOtpByEmail test', async () => {
    // Arrange
    const key = `${email}:${ip}`
    redisMockClient.set(key, JSON.stringify(otp))

    // Act
    await expect(cache.getOtpForEmail(email, ip)).resolves.toStrictEqual(otp)

    // Assert
    expect(redisMockClient.get).toHaveBeenCalledWith(key, expect.any(Function))
  })

  test('getOtpByEmail null test', async () => {
    // Arrange
    await expect(cache.getOtpForEmail(email, ip)).resolves.toStrictEqual(null)

    // Assert
    expect(redisMockClient.get).toHaveBeenCalledWith(
      `${email}:${ip}`,
      expect.any(Function),
    )
  })

  test('getOtpByEmail throws test', async () => {
    // Arrange
    const originalGet = redisMockClient.get
    redisMockClient.get = (_, callback) => {
      if (callback == null) {
        return false
      }
      callback(Error(), '')
      return true
    }
    const key = `${email}:${ip}`
    redisMockClient.set(key, JSON.stringify(otp))

    // Act
    await expect(cache.getOtpForEmail(email, ip)).rejects.toThrow()

    // Assert
    redisMockClient.get = originalGet
  })

  test('setOtpByEmail test', async () => {
    // Arrange
    await cache.setOtpForEmail(email, ip, otp)

    // Assert
    expect(redisMockClient.set).toHaveBeenCalledWith(
      `${email}:${ip}`,
      JSON.stringify(otp),
      'EX',
      10,
      expect.any(Function),
    )
  })

  test('setOtpByEmail throws test', async () => {
    // Arrange
    const originalSet = redisMockClient.set
    redisMockClient.set = () => {
      throw Error()
    }

    // Act
    await expect(cache.setOtpForEmail(email, ip, otp)).rejects.toThrow()

    // Assert
    redisMockClient.set = originalSet
  })
})
