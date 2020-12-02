import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../../constants'
import { StatisticsRepositoryInterface } from '../../../repositories/interfaces/StatisticsRepositoryInterface'
import * as interfaces from '../interfaces'
import { GlobalStatistics } from '..'

@injectable()
export class StatisticsService implements interfaces.StatisticsService {
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
