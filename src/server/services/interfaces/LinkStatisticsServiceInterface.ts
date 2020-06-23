import { LinkStatisticsInterface } from '../../../shared/interfaces/link-statistics'

export interface LinkStatisticsServiceInterface {
  getLinkStatistics(
    userId: number,
    shortUrl: string,
  ): Promise<LinkStatisticsInterface | null>
}
