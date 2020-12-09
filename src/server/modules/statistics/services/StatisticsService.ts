import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../../constants'
import { StatisticsRepository } from '../interfaces/StatisticsRepository'
import * as interfaces from '../interfaces'
import { GlobalStatistics } from '..'

@injectable()
export class StatisticsService implements interfaces.StatisticsService {
  private statisticsRepository: StatisticsRepository

  public constructor(
    @inject(DependencyIds.statisticsRepository)
    statisticsRepository: StatisticsRepository,
  ) {
    this.statisticsRepository = statisticsRepository
  }

  getGlobalStatistics: () => Promise<GlobalStatistics> = async () => {
    return this.statisticsRepository.getGlobalStatistics()
  }
}

export default StatisticsService
