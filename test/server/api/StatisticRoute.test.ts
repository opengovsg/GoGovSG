import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { StatisticsRepositoryInterface } from '../../../src/server/repositories/interfaces/StatisticsRepositoryInterface'

const getGlobalStatistics = jest.fn()
getGlobalStatistics.mockResolvedValue({
  linkCount: 1,
  userCount: 2,
  clickCount: 3,
})
// Binds mockups before binding default
container
  .bind<StatisticsRepositoryInterface>(DependencyIds.statisticsRepository)
  .toConstantValue({ getGlobalStatistics })

// Importing setup app
// eslint-disable-next-line import/first
import app from './setup'

describe('GET /api/stats', () => {
  test('get statistics', async (done) => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(Object.keys(res.body).sort()).toEqual(
      ['linkCount', 'clickCount', 'userCount'].sort(),
    )
    done()
  })
})
