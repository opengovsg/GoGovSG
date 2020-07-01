import { inject, injectable } from 'inversify'

import { DependencyIds } from '../constants'
import { LinkStatisticsServiceInterface } from './interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsRepositoryInterface } from '../repositories/interfaces/LinkStatisticsRepositoryInterface'
import { LinkStatisticsInterface } from '../../shared/interfaces/link-statistics'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'
import { NotFoundError } from '../util/error'
import { logger } from '../config'

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

  updateLinkStatistics: (
    shortUrl: string,
    userAgent: string,
  ) => Promise<void> = async (shortUrl, userAgent) => {
    Promise.all([
      this.linkStatisticsRepository.incrementClick(shortUrl),
      this.linkStatisticsRepository.updateDailyStatistics(shortUrl),
      this.linkStatisticsRepository.updateWeekdayStatistics(shortUrl),
      this.linkStatisticsRepository.updateDeviceStatistics(shortUrl, userAgent),
    ]).catch((error) =>
      logger.error(`Unable to update link statistics: ${error}`),
    )
  }

  getLinkStatistics: (
    userId: number,
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface | null> = async (userId, shortUrl) => {
    const userOwnsLink = !!(await this.userRepository.findOneUrlForUser(
      userId,
      shortUrl,
    ))
    if (!userOwnsLink) {
      throw new NotFoundError('User does not own this short url')
    }
    return this.linkStatisticsRepository.findByShortUrl(shortUrl)
  }
}

export default LinkStatisticsService
