import { redisMockClient, urlModelMock, userModelMock } from '../api/util'

import { StatisticsRepository } from '../../../src/server/repositories/StatisticsRepository'

jest.mock('../../../src/server/redis', () => ({
  statClient: redisMockClient,
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

const setSpy = jest.spyOn(redisMockClient, 'set')
const mgetSpy = jest.spyOn(redisMockClient, 'mget')
const repository = new StatisticsRepository()

describe('StatisticsRepository', () => {
  const userCount = 1
  const clickCount = 3
  const linkCount = 2

  beforeEach(async () => {
    await new Promise((resolve) => {
      redisMockClient.flushall(() => resolve())
    })
    setSpy.mockClear()
    mgetSpy.mockClear()
  })

  afterEach(async () => {
    delete (userModelMock as any).count
    delete (urlModelMock as any).count
    delete (urlModelMock as any).sum
  })

  it('returns values from Redis if present', async () => {
    redisMockClient.set('userCount', userCount.toString())
    redisMockClient.set('clickCount', clickCount.toString())
    redisMockClient.set('linkCount', linkCount.toString())
    setSpy.mockClear()

    await expect(repository.getGlobalStatistics()).resolves.toStrictEqual({
      userCount,
      clickCount,
      linkCount,
    })
    expect(mgetSpy).toHaveBeenCalled()
    expect(setSpy).not.toHaveBeenCalled()
  })

  it('returns values from Sequelize and sets Redis if not cached', async () => {
    const raiseError: (
      _keys: string[],
      callback: (err: Error | null, reply?: string[]) => void,
    ) => void = (_keys, callback) => {
      callback(new Error('error'))
    }

    // @ts-ignore
    mgetSpy.mockImplementation(raiseError)
    Object.assign(userModelMock, { count: () => userCount })
    Object.assign(urlModelMock, {
      sum: () => clickCount,
      count: () => linkCount,
    })

    await expect(repository.getGlobalStatistics()).resolves.toStrictEqual({
      userCount,
      clickCount,
      linkCount,
    })
    expect(mgetSpy).toHaveBeenCalled()
    expect(setSpy).toHaveBeenCalledTimes(3)
  })

  it('returns values from Sequelize even if Redis set fails', async () => {
    const raiseError: (
      _key: string,
      _value: string,
      _mode: string,
      _duration: number,
      callback: (err: Error | null, reply?: 'OK') => void,
    ) => void = (_key, _value, _mode, _duration, callback) => {
      callback(new Error('error'))
    }

    Object.assign(userModelMock, { count: () => userCount })
    Object.assign(urlModelMock, {
      sum: () => clickCount,
      count: () => linkCount,
    })

    // @ts-ignore
    setSpy.mockImplementation(raiseError)

    await expect(repository.getGlobalStatistics()).resolves.toStrictEqual({
      userCount,
      clickCount,
      linkCount,
    })
    expect(mgetSpy).toHaveBeenCalled()
    expect(setSpy).toHaveBeenCalledTimes(3)
  })
})
