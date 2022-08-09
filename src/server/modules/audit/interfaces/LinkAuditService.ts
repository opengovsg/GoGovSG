import { UrlHistoryRecord } from './UrlHistoryRepository'

export type LinkChangeKey =
  | 'description'
  | 'isFile'
  | 'state'
  | 'userEmail'
  | 'longUrl'

export type LinkChangeType = 'create' | 'update'

export interface LinkChangeSet {
  type: LinkChangeType
  key: LinkChangeKey
  prevValue: string | boolean
  currValue: string | boolean
  updatedAt: string
}

export interface LinkAudit {
  changes: LinkChangeSet[]
  offset: number
  limit: number
  totalCount: number
}

export interface LinkAuditService {
  computePairwiseChangeSet(
    currUrlHistory: UrlHistoryRecord,
    prevUrlHistory: UrlHistoryRecord,
    keysToTrack?: LinkChangeKey[],
  ): LinkChangeSet[]

  computeInitialChangeSet(
    currUrlHistory: UrlHistoryRecord,
    keysToTrack?: LinkChangeKey[],
  ): LinkChangeSet[]

  getChangeSets(
    urlHistories: UrlHistoryRecord[],
    isLastCreate: boolean,
  ): LinkChangeSet[]

  /**
   * Retrieves the link audit log by limit and offset for a specified link.
   *
   * @param userId The user id of the requester.
   * @param shortUrl The short url which audit log is to be returned.
   * @param limit Number of changes in audit log to return, starting at offset number and ordered by recency.
   * @param offset Offset number in audit log to return limit number of changes after.
   * @returns Link audit log for given short link.
   */
  getLinkAudit(
    userId: number,
    shortUrl: string,
    offset?: number,
    limit?: number,
  ): Promise<LinkAudit | null>
}

export default LinkAuditService
