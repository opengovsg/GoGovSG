import { injectable } from 'inversify'

import { LinkStatisticsServiceInterface } from '../../../../src/server/services/interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsInterface } from '../../../../src/shared/interfaces/link-statistics'

@injectable()
export class LinkStatisticsServiceMock
  implements LinkStatisticsServiceInterface {
  updateLinkStatistics: (shortUrl: string) => Promise<void> = () => {
    return Promise.resolve()
  }

  getLinkStatistics: (
    userId: number,
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface> = () => {
    return Promise.resolve({
      totalClicks: 1,
      deviceClicks: {
        desktop: 1,
        tablet: 2,
        mobile: 3,
        others: 4,
      },
      dailyClicks: [],
      weekdayClicks: [],
    } as LinkStatisticsInterface)
  }
}

export default LinkStatisticsServiceMock
