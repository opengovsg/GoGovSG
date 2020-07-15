import { LinkStatisticsInterface } from '../../../shared/interfaces/link-statistics'
import { DeviceType } from '../../services/interfaces/DeviceCheckServiceInterface'

export interface LinkStatisticsRepositoryInterface {
  /**
   * Retrieves link statistics for a specified short link.
   *
   * @param shortUrl The target short url to retrieve link statistics.
   */
  findByShortUrl(shortUrl: string): Promise<LinkStatisticsInterface | null>

  /**
   * Update link statistics of the specified short url.
   *
   * @param shortUrl The short url statistics to update.
   */
  updateLinkStatistics: (shortUrl: string, device: DeviceType) => void
}
