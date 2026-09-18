import Express from 'express'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../constants.js'
import { StatisticsService } from './interfaces/index.js'

@injectable()
export class StatisticsController {
  private statisticsService: StatisticsService

  public constructor(
    @inject(DependencyIds.statisticsService)
    statisticsService: StatisticsService,
  ) {
    this.statisticsService = statisticsService
  }

  public getGlobalStatistics: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res.status(200).json(this.statisticsService.getGlobalStatistics())
    return
  }
}

export default StatisticsController
