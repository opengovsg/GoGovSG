import { LinkStatisticsInterface } from '../../../shared/interfaces/link-statistics'

export interface LinkStatisticsServiceInterface {
  /**
   * Updates the relevant statistics of a specified link.
   *
   * @param shortUrl The short url which statistics is to be updated.
   * @param userAgent The user agent string from the http request.
   * @returns Promise that resolves to be empty.
   */
  updateLinkStatistics(shortUrl: string, userAgent: string): Promise<void>

  /**
   * Retrieves the link statistics for a specified link.
   *
   * @param userId The user id of the requester.
   * @param shortUrl The short url which statistics is to be retrieved.
   */
  getLinkStatistics(
    userId: number,
    shortUrl: string,
  ): Promise<LinkStatisticsInterface | null>
}
