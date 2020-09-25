import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { MockStatisticsRepository } from '../mocks/repositories/StatisticsRepository'
import { StatisticsRepositoryInterface } from '../../../src/server/repositories/interfaces/StatisticsRepositoryInterface'

// Binds mockups before binding default
container
  .bind<StatisticsRepositoryInterface>(DependencyIds.statisticsRepository)
  .to(MockStatisticsRepository)

// Importing setup app
import app from './setup'

describe('GET: /api/stats', () => {
  test('positive test: Should get object of statistics', async (done) => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(Object.keys(res.body).sort()).toEqual(
      ['linkCount', 'clickCount', 'userCount'].sort(),
    )
    done()
  })
})
