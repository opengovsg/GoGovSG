import { OtpMapper } from '../../../../mappers/OtpMapper'
import { redisMockClient } from '../../../../../../test/server/api/util'

jest.mock('../../../../redis', () => ({
  otpClient: redisMockClient,
}))

const setSpy = jest.spyOn(redisMockClient, 'setEx')
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
    await redisMockClient.flushAll()
  })

  afterEach(() => {
    setSpy.mockClear()
    getSpy.mockClear()
    delSpy.mockClear()
  })

  test('deleteOtpByEmail test', async () => {
    // Arrange
    const key = `${email}:${ip}`
    await redisMockClient.set(key, 'aa')

    // Act
    await cache.deleteOtpByEmail(email, ip)

    // Assert
    expect(redisMockClient.del).toHaveBeenCalledTimes(1)
    expect(redisMockClient.del).toHaveBeenCalledWith(key)
  })

  test('getOtpByEmail test', async () => {
    // Arrange
    const key = `${email}:${ip}`
    await redisMockClient.set(key, JSON.stringify(otp))

    // Act
    await expect(cache.getOtpForEmail(email, ip)).resolves.toStrictEqual(otp)

    // Assert
    expect(redisMockClient.get).toHaveBeenCalledWith(key)
  })

  test('getOtpByEmail null test', async () => {
    // Arrange
    await expect(cache.getOtpForEmail(email, ip)).resolves.toStrictEqual(null)

    // Assert
    expect(redisMockClient.get).toHaveBeenCalledWith(`${email}:${ip}`)
  })

  test('getOtpByEmail throws test', async () => {
    // Arrange
    getSpy.mockRejectedValueOnce(new Error('redis down'))
    const key = `${email}:${ip}`
    await redisMockClient.set(key, JSON.stringify(otp))

    // Act
    await expect(cache.getOtpForEmail(email, ip)).rejects.toThrow()
  })

  test('setOtpByEmail test', async () => {
    // Arrange
    await cache.setOtpForEmail(email, ip, otp)

    // Assert
    expect(redisMockClient.setEx).toHaveBeenCalledWith(
      `${email}:${ip}`,
      10,
      JSON.stringify(otp),
    )
  })

  test('setOtpByEmail throws test', async () => {
    // Arrange
    setSpy.mockRejectedValueOnce(new Error('redis down'))

    // Act
    await expect(cache.setOtpForEmail(email, ip, otp)).rejects.toThrow()
  })
})
