import { inject, injectable } from 'inversify'
import { StatisticsServiceInterface } from './interfaces/StatisticsServiceInterface'
import { DependencyIds } from '../constants'
import { StatisticsRepositoryInterface } from '../repositories/interfaces/StatisticsRepositoryInterface'
import { GlobalStatistics } from '../repositories/types'

@injectable()
export class StatisticsService implements StatisticsServiceInterface {
  private statisticsRepository: StatisticsRepositoryInterface

  public constructor(
    @inject(DependencyIds.statisticsRepository)
    statisticsRepository: StatisticsRepositoryInterface,
  ) {
    this.statisticsRepository = statisticsRepository
  }

  getGlobalStatistics: () => Promise<GlobalStatistics> = async () => {
    return this.statisticsRepository.getGlobalStatistics()
  }
}

export default StatisticsService
