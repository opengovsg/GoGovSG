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
   * @param {string} shortUrl
   * @returns {Promise<boolean>} Indicates if the update was successful.
   */
  incrementClick: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<boolean>

  /**
   * Asynchronously upserts the relevant short link's statistics.
   *
   * @param shortUrl The relevant short url.
   * @returns {Promise<boolean>} Indicates if the update was successful.
   */
  updateDailyStatistics: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<boolean>

  /**
   * Asynchronously updates the relevant short link's week map statistics.
   *
   * @param shortUrl The relevant short url.
   * @returns {Promise<boolean>} Indicates if the update was successful.
   */
  updateWeekdayStatistics: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<boolean>

  /**
   * Asynchronously updates the relevant short link's device statistics.
   *
   * @param shortUrl The relevant short url.
   * @param userAgent The relevant user agent string to parse device type.
   * @returns {Promise<boolean>} Indicates if the update was successful.
   */
  updateDeviceStatistics: (
    shortUrl: string,
    userAgent: string,
    transaction?: Transaction,
  ) => Promise<boolean>
}
