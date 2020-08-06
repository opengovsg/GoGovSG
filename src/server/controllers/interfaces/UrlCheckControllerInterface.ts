import Express from 'express'

export interface UrlCheckControllerInterface {
  checkUrl(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ): Promise<void>
}
