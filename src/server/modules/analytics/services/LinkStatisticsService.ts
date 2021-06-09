import { inject, injectable } from 'inversify'

import { DependencyIds } from '../../../constants'
import * as interfaces from '../interfaces'
import { LinkStatisticsRepository } from '../interfaces'
import { LinkStatistics } from '../../../../shared/interfaces/link-statistics'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { NotFoundError } from '../../../util/error'
import { logger } from '../../../config'
import { DeviceCheckService } from './DeviceCheckService'

@injectable()
export class LinkStatisticsService implements interfaces.LinkStatisticsService {
  private deviceCheckService: DeviceCheckService

  private userRepository: UserRepositoryInterface

  private linkStatisticsRepository: LinkStatisticsRepository

  public constructor(
    @inject(DependencyIds.deviceCheckService)
    deviceCheckService: DeviceCheckService,
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.linkStatisticsRepository)
    linkStatisticsRepository: LinkStatisticsRepository,
  ) {
    this.deviceCheckService = deviceCheckService
    this.userRepository = userRepository
    this.linkStatisticsRepository = linkStatisticsRepository
  }

  updateLinkStatistics: (shortUrl: string, userAgent: string) => Promise<void> =
    async (shortUrl, userAgent) => {
      const deviceType = this.deviceCheckService.getDeviceType(userAgent)

      Promise.all([
        this.linkStatisticsRepository.updateLinkStatistics(
          shortUrl,
          deviceType,
        ),
      ]).catch((error) =>
        logger.error(`Unable to update link statistics: ${error}`),
      )
    }

  getLinkStatistics: (
    userId: number,
    shortUrl: string,
    offsetDays?: number,
  ) => Promise<LinkStatistics | null> = async (
    userId,
    shortUrl,
    offsetDays,
  ) => {
    const userOwnsLink = !!(await this.userRepository.findOneUrlForUser(
      userId,
      shortUrl,
    ))
    if (!userOwnsLink) {
      throw new NotFoundError('User does not own this short url')
    }
    return this.linkStatisticsRepository.findByShortUrl(shortUrl, offsetDays)
  }
}

export default LinkStatisticsService
