/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { LinkStatisticsRepositoryInterface } from '../../../../src/server/repositories/interfaces/LinkStatisticsRepositoryInterface'
import { LinkStatisticsInterface } from '../../../../src/shared/interfaces/link-statistics'

@injectable()
export class MockLinkStatisticsRepository
  implements LinkStatisticsRepositoryInterface {
  findByShortUrl(_: string): Promise<LinkStatisticsInterface | null> {
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
}

export default MockLinkStatisticsRepository
