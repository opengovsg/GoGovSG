import { LinkStatisticsService } from '../../../src/server/services/LinkStatisticsService'
import { MockLinkStatisticsRepository } from '../mocks/repositories/LinkStatisticsRepository'
import { MockUserRepository } from '../mocks/repositories/UserRepository'

/**
 * Unit tests for StatisticService.
 */
describe('LinkStatisticService tests', () => {
  describe('findByShortUrl tests', () => {
    test('should return statistics from repository', async () => {
      const service = new LinkStatisticsService(
        new MockUserRepository(),
        new MockLinkStatisticsRepository(),
      )
      await expect(
        service.getLinkStatistics(123, 'hello'),
      ).resolves.toStrictEqual({
        deviceClicks: {
          desktopClicks: 1,
          tabletClicks: 0,
          mobileClicks: 0,
          otherClicks: 0,
        },
        dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
        weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
      })
    })
  })
})
