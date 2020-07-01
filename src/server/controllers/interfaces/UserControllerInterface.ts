import Express from 'express'

export interface UserControllerInterface {
  createUrl(req: Express.Request, res: Express.Response): Promise<void>

  updateUrl(req: Express.Request, res: Express.Response): Promise<void>

  changeOwnership(req: Express.Request, res: Express.Response): Promise<void>

  getUrlsWithConditions(
    req: Express.Request,
    res: Express.Response,
  ): Promise<void>

  getUserMessage(req: Express.Request, res: Express.Response): Promise<void>
}
