import { injectable } from 'inversify'

import { LinkStatisticsServiceInterface } from '../../../../src/server/services/interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsInterface } from '../../../../src/shared/interfaces/link-statistics'

@injectable()
export class LinkStatisticsServiceMock
  implements LinkStatisticsServiceInterface {
  updateLinkStatistics: (
    shortUrl: string,
    userAgent: string,
  ) => Promise<void> = () => {
    return Promise.resolve()
  }

  getLinkStatistics: (
    userId: number,
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface> = () => {
    return Promise.resolve({
      deviceClicks: {
        desktopClicks: 1,
        tabletClicks: 2,
        mobileClicks: 3,
        otherClicks: 4,
      },
      dailyClicks: [],
      weekdayClicks: [],
    } as LinkStatisticsInterface)
  }
}

export default LinkStatisticsServiceMock
