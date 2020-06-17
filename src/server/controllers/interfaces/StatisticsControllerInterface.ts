import Express from 'express'

export interface StatisticsControllerInterface {
  getGlobalStatistics(
    req: Express.Request,
    res: Express.Response,
  ): Promise<void>
}
