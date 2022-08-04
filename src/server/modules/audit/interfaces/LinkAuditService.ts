interface LinkChangeSet {
  type: string
  prevValue: string
  currValue: string
  updatedAt: Date
}

export interface LinkAudit {
  changes: LinkChangeSet[]
  offset: number
  limit: number
  totalCount: number
}

export interface LinkAuditService {
  /**
   * Retrieves the link audit log by limit and offset for a specified link.
   *
   * @param userId The user id of the requester.
   * @param shortUrl The short url which audit log is to be returned.
   * @param limit Number of changes in audit log to return, starting at offset number and ordered by recency.
   * @param offset Offset number in audit log to return limit number of changes after.
   */
  getLinkAudit(
    userId: number,
    shortUrl: string,
    offset?: number,
    limit?: number,
  ): Promise<LinkAudit | null>
}

export default LinkAuditService
