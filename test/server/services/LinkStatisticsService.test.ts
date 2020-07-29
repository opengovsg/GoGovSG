import Sequelize from 'sequelize-mock'

import { MockLinkStatisticsRepository } from '../mocks/repositories/LinkStatisticsRepository'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import { LinkStatisticsService } from '../../../src/server/services/LinkStatisticsService'
import { DeviceCheckServiceMock } from '../mocks/services/DeviceCheckService'

jest.mock('../../../src/server/util/sequelize', () => ({
  sequelize: new Sequelize(),
}))

const linkStatisticRepository = new MockLinkStatisticsRepository()

const service = new LinkStatisticsService(
  new DeviceCheckServiceMock(),
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
        totalClicks: 1,
        deviceClicks: {
          desktop: 1,
          tablet: 0,
          mobile: 0,
          others: 0,
        },
        dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
        weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
      })
    })
  })

  describe('updateLinkStatistics tests', () => {
    const updateLinkStatisticsSpy = jest.spyOn(
      linkStatisticRepository,
      'updateLinkStatistics',
    )

    test('should update relevant tables with same transaction', async () => {
      await service.updateLinkStatistics('a', '')
      expect(updateLinkStatisticsSpy).toBeCalledWith('a', 'desktop')
    })
  })
})
