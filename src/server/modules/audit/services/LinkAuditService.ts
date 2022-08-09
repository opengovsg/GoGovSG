import { inject, injectable } from 'inversify'
import _ from 'lodash'
import * as interfaces from '../interfaces'
import { NotFoundError } from '../../../util/error'
import { DependencyIds } from '../../../constants'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'

@injectable()
export class LinkAuditService implements interfaces.LinkAuditService {
  private userRepository: UserRepositoryInterface

  private urlHistoryRepository: interfaces.UrlHistoryRepository

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.urlHistoryRepository)
    urlHistoryRepository: interfaces.UrlHistoryRepository,
  ) {
    this.userRepository = userRepository
    this.urlHistoryRepository = urlHistoryRepository
  }

  // Helper function to compute pairwise changes between two rows of url histories
  computePairwiseChangeSet: (
    currUrlHistory: interfaces.UrlHistoryRecord,
    prevUrlHistory: interfaces.UrlHistoryRecord,
    keysToTrack?: interfaces.LinkChangeKey[],
  ) => interfaces.LinkChangeSet[] = (
    currUrlHistory,
    prevUrlHistory,
    keysToTrack = ['state', 'userEmail', 'longUrl'],
  ) => {
    const changeSets: interfaces.LinkChangeSet[] = []

    keysToTrack.forEach((keyToTrack) => {
      const currValue =
        currUrlHistory[keyToTrack as keyof interfaces.UrlHistoryRecord]
      const prevValue =
        prevUrlHistory[keyToTrack as keyof interfaces.UrlHistoryRecord]
      if (!_.isEqual(currValue, prevValue)) {
        changeSets.push({
          type: 'update',
          key: keyToTrack as interfaces.LinkChangeKey,
          prevValue,
          currValue,
          updatedAt: currUrlHistory.createdAt,
        })
      }
    })
    return changeSets
  }

  // Helper function to compute change sets for initial url creation
  computeInitialChangeSet: (
    currUrlHistory: interfaces.UrlHistoryRecord,
    keysToTrack?: interfaces.LinkChangeKey[],
  ) => interfaces.LinkChangeSet[] = (
    currUrlHistory,
    keysToTrack = ['longUrl'],
  ) => {
    const changeSets: interfaces.LinkChangeSet[] = []

    keysToTrack.forEach((keyToTrack) => {
      changeSets.push({
        type: 'create',
        key: keyToTrack as interfaces.LinkChangeKey,
        prevValue: '',
        currValue:
          currUrlHistory[keyToTrack as keyof interfaces.UrlHistoryRecord],
        updatedAt: currUrlHistory.createdAt,
      })
    })
    return changeSets
  }

  getChangeSets: (
    urlHistories: interfaces.UrlHistoryRecord[],
    isLastCreate: boolean,
  ) => interfaces.LinkChangeSet[] = (urlHistories, isLastCreate = false) => {
    const changeSets = []
    for (let i = 0; i < urlHistories.length - 1; i += 1) {
      changeSets.push(
        ...this.computePairwiseChangeSet(urlHistories[i], urlHistories[i + 1]),
      )
    }
    if (isLastCreate) {
      changeSets.push(
        ...this.computeInitialChangeSet(urlHistories[urlHistories.length - 1]),
      )
    }
    return changeSets
  }

  getLinkAudit: (
    userId: number,
    shortUrl: string,
    limit?: number,
    offset?: number,
  ) => Promise<interfaces.LinkAudit | null> = async (
    userId,
    shortUrl,
    limit = 10,
    offset = 0,
  ) => {
    const userOwnsLink = !!(await this.userRepository.findOneUrlForUser(
      userId,
      shortUrl,
    ))
    if (!userOwnsLink) {
      throw new NotFoundError('User does not own this short url')
    }
    const totalCount = await this.urlHistoryRepository.getCountByShortUrl(
      shortUrl,
    )

    const urlHistories = await this.urlHistoryRepository.findByShortUrl(
      shortUrl,
      limit + 1,
      offset,
    )

    if (urlHistories.length === 0) {
      // invalid limit or offset
      throw new Error('Invalid offset or limit provided')
    }

    const includesCreate = limit + 1 + offset > totalCount

    return {
      changes: this.getChangeSets(urlHistories, includesCreate),
      limit,
      offset,
      totalCount,
    }
  }
}

export default LinkAuditService
