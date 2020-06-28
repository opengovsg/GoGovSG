/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { LinkStatisticsRepositoryInterface } from '../../../../src/server/repositories/interfaces/LinkStatisticsRepositoryInterface'
import { LinkStatisticsInterface } from '../../../../src/shared/interfaces/link-statistics'

@injectable()
export class MockLinkStatisticsRepository
  implements LinkStatisticsRepositoryInterface {
  findByShortUrl: (
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface | null> = () => {
    return Promise.resolve({
      deviceClicks: {
        desktopClicks: 1,
        tabletClicks: 0,
        mobileClicks: 0,
        otherClicks: 0,
      },
      dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
      weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
    })
  }

  incrementClick: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateDailyStatistics: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateWeekdayStatistics: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateDeviceStatistics: (
    shortUrl: string,
    userAgent: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()
}

export default MockLinkStatisticsRepository
