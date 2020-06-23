import { LinkStatisticsInterface } from '../../../shared/interfaces/link-statistics'

export interface LinkStatisticsRepositoryInterface {
  /**
   * Retrieves link statistics for a specified short link.
   *
   * @param shortUrl The target short url to retrieve link statistics.
   */
  findByShortUrl(shortUrl: string): Promise<LinkStatisticsInterface | null>
}
