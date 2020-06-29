import Express from 'express'

export interface LinkStatisticsControllerInterface {
  getLinkStatistics(req: Express.Request, res: Express.Response): Promise<void>
}
