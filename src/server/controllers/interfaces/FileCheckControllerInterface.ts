import Express from 'express'

export interface FileCheckControllerInterface {
  checkFile(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ): Promise<void>
}
