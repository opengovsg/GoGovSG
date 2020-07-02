import Sequelize from 'sequelize-mock'

import { MockLinkStatisticsRepository } from '../mocks/repositories/LinkStatisticsRepository'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import { LinkStatisticsService } from '../../../src/server/services/LinkStatisticsService'

jest.mock('../../../src/server/util/sequelize', () => ({
  sequelize: new Sequelize(),
}))

const linkStatisticRepository = new MockLinkStatisticsRepository()

const service = new LinkStatisticsService(
  new MockUserRepository(),
  linkStatisticRepository,
)

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

    test('should update relevant tables with same transaction', async () => {
      await service.updateLinkStatistics('a')
      expect(incrementClickSpy).toBeCalledWith('a')
    })
  })
})
