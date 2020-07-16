import { inject, injectable } from 'inversify'

import { DependencyIds } from '../constants'
import { LinkStatisticsServiceInterface } from './interfaces/LinkStatisticsServiceInterface'
import { LinkStatisticsRepositoryInterface } from '../repositories/interfaces/LinkStatisticsRepositoryInterface'
import { LinkStatisticsInterface } from '../../shared/interfaces/link-statistics'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'
import { NotFoundError } from '../util/error'
import { logger } from '../config'
import { DeviceCheckService } from './DeviceCheckService'

@injectable()
export class LinkStatisticsService implements LinkStatisticsServiceInterface {
  private deviceCheckService: DeviceCheckService

  private userRepository: UserRepositoryInterface

  private linkStatisticsRepository: LinkStatisticsRepositoryInterface

  public constructor(
    @inject(DependencyIds.deviceCheckService)
    deviceCheckService: DeviceCheckService,
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.linkStatisticsRepository)
    linkStatisticsRepository: LinkStatisticsRepositoryInterface,
  ) {
    this.deviceCheckService = deviceCheckService
    this.userRepository = userRepository
    this.linkStatisticsRepository = linkStatisticsRepository
  }

  updateLinkStatistics: (
    shortUrl: string,
    userAgent: string,
  ) => Promise<void> = async (shortUrl, userAgent) => {
    const deviceType = this.deviceCheckService.getDeviceType(userAgent)

    Promise.all([
      this.linkStatisticsRepository.updateLinkStatistics(shortUrl, deviceType),
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
