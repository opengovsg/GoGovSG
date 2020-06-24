import Express from 'express'
import { inject, injectable } from 'inversify'
import { StatisticsControllerInterface } from './interfaces/StatisticsControllerInterface'
import { StatisticsServiceInterface } from '../services/interfaces/StatisticsServiceInterface'
import { DependencyIds } from '../constants'

@injectable()
export class StatisticsController implements StatisticsControllerInterface {
  private statisticsService: StatisticsServiceInterface

  public constructor(
    @inject(DependencyIds.statisticsService)
    statisticsService: StatisticsServiceInterface,
  ) {
    this.statisticsService = statisticsService
  }

  public getGlobalStatistics: (
    req: Express.Request,
    res: Express.Response,
  ) => Promise<void> = async (_, res) => {
    res.status(200).json(await this.statisticsService.getGlobalStatistics())
  }
}

export default StatisticsController
