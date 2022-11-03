export interface UrlHistoryRecord {
  // to change depending on what records changes are requested for
  userEmail: string
  longUrl: string
  shortUrl: string
  state: string
  description: string
  isFile: boolean
  createdAt: string
  tagStrings: string
}

export interface UrlHistoryRepository {
  /**
   * Retrieve history of URL record changes.
   * Starting at offset, retrieves limit num of records.
   *
   * @param shortUrl Short url to retrieve records for.
   * @param limit Number of records to return.
   * @param offset Offset number of records before retrieval.
   */
  findByShortUrl(
    shortUrl: string,
    limit: number,
    offset: number,
  ): Promise<UrlHistoryRecord[]>

  /**
   * Retrieve total count of history changes for a shortUrl.
   *
   * @param shortUrl
   */
  getCountByShortUrl(shortUrl: string): Promise<number>
}
