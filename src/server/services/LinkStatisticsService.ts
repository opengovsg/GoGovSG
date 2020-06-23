import { inject, injectable } from 'inversify'

import { DependencyIds } from '../constants'
import { LinkStatisticsServiceInterface } from './interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsRepositoryInterface } from '../repositories/interfaces/LinkStatisticsRepositoryInterface'
import { LinkStatisticsInterface } from '../../shared/interfaces/link-statistics'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'

@injectable()
export class LinkStatisticsService implements LinkStatisticsServiceInterface {
  private userRepository: UserRepositoryInterface

  private linkStatisticsRepository: LinkStatisticsRepositoryInterface

  public constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.linkStatisticsRepository)
    linkStatisticsRepository: LinkStatisticsRepositoryInterface,
  ) {
    this.userRepository = userRepository
    this.linkStatisticsRepository = linkStatisticsRepository
  }

  /**
   * Retrieves the link statistics for a specified short url.
   * This method returns null if user does not own the link.
   *
   * @param shortUrl The short url to fetch link statistics.
   */
  getLinkStatistics: (
    userId: number,
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface | null> = async (userId, shortUrl) => {
    const userOwnsLink = !!(await this.userRepository.findOneUrlForUser(
      userId,
      shortUrl,
    ))
    if (!userOwnsLink) return null
    return this.linkStatisticsRepository.findByShortUrl(shortUrl)
  }
}

export default LinkStatisticsService
