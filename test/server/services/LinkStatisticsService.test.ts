import { MockSequelizeTransaction } from '../api/util'

const sequelize = new MockSequelizeTransaction()

import { MockLinkStatisticsRepository } from '../mocks/repositories/LinkStatisticsRepository'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import { LinkStatisticsService } from '../../../src/server/services/LinkStatisticsService'

jest.mock('../../../src/server/util/sequelize', () => ({
  sequelize,
}))

const linkStatisticRepository = new MockLinkStatisticsRepository()

const service = new LinkStatisticsService(
  new MockUserRepository(),
  linkStatisticRepository,
)

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'

/**
 * Unit tests for StatisticService.
 */
describe('LinkStatisticService tests', () => {
  describe('findByShortUrl tests', () => {
    test('should return statistics from repository', async () => {
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

  describe('updateLinkStatistics tests', () => {
    const incrementClickSpy = jest.spyOn(
      linkStatisticRepository,
      'incrementClick',
    )
    const updateDailyStatisticsSpy = jest.spyOn(
      linkStatisticRepository,
      'updateDailyStatistics',
    )
    const updateWeekdayStatisticsSpy = jest.spyOn(
      linkStatisticRepository,
      'updateWeekdayStatistics',
    )
    const updateDeviceStatisticsSpy = jest.spyOn(
      linkStatisticRepository,
      'updateDeviceStatistics',
    )

    test('should update relevant tables with same transaction', async () => {
      await service.updateLinkStatistics('a', userAgent)
      const transactionItem = 'hello'
      if (sequelize.fn) sequelize.fn(transactionItem)

      expect(incrementClickSpy).toBeCalledWith('a', transactionItem)
      expect(updateDailyStatisticsSpy).toBeCalledWith('a', transactionItem)
      expect(updateWeekdayStatisticsSpy).toBeCalledWith('a', transactionItem)
      expect(updateDeviceStatisticsSpy).toBeCalledWith(
        'a',
        userAgent,
        transactionItem,
      )
    })
  })
})
