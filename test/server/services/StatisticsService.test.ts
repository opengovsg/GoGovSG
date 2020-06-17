import { StatisticsService } from '../../../src/server/services/StatisticsService'
import { MockStatisticsRepository } from '../mocks/repositories/StatisticsRepository'

/**
 * Unit tests for StatisticService.
 */
describe('StatisticService tests', () => {
  describe('getGlobalStatistics tests', () => {
    it('Should return statistics from repository', async () => {
      const service = new StatisticsService(new MockStatisticsRepository())
      await expect(service.getGlobalStatistics()).resolves.toStrictEqual({
        userCount: 1,
        clickCount: 2,
        linkCount: 3,
      })
    })
  })
})
