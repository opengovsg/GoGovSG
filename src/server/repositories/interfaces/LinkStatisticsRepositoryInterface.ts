import { Transaction } from 'sequelize/types'

import { LinkStatisticsInterface } from '../../../shared/interfaces/link-statistics'

export interface LinkStatisticsRepositoryInterface {
  /**
   * Retrieves link statistics for a specified short link.
   *
   * @param shortUrl The target short url to retrieve link statistics.
   */
  findByShortUrl(shortUrl: string): Promise<LinkStatisticsInterface | null>

  /**
   * Asynchronously increment the number of clicks in the database.
   *
   * @param shortUrl
   * @returns Indicates if the update was successful.
   */
  incrementClick: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<boolean>
}
