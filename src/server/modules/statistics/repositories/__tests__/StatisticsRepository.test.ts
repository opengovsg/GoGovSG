import redisMock from 'redis-mock'
import SequelizeMock from 'sequelize-mock'

export const sequelizeMock = new SequelizeMock()

export const urlModelMock = sequelizeMock.define(
  'url',
  {
    shortUrl: 'a',
    longUrl: 'aa',
    state: 'ACTIVE',
    clicks: 8,
  },
  {
    instanceMethods: {
      findOne: () => {},
      increment: () => {},
    },
  },
)

export const userModelMock = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  scope: jest.fn(),
  findOrCreate: ({ where: { email } }: { where: { email: string } }) =>
    Promise.resolve([
      {
        get: () => email,
      },
      {},
    ]),
}

const redisMockClient = redisMock.createClient()

jest.mock('../../../../redis', () => ({
  statClient: redisMockClient,
}))

jest.mock('../../../../models/user', () => ({
  User: userModelMock,
}))

jest.mock('../../../../models/url', () => ({
  Url: urlModelMock,
}))

const setSpy = jest.spyOn(redisMockClient, 'set')
const mgetSpy = jest.spyOn(redisMockClient, 'mget')

const { StatisticsRepository } = require('..')

const repository = new StatisticsRepository()

describe('StatisticsRepository', () => {
  const userCount = 1
  const clickCount = 3
  const linkCount = 2

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
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
