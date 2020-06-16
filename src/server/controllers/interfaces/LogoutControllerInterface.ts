import Express from 'express'

export interface LogoutControllerInterface {
  logOut(req: Express.Request, res: Express.Response): void
}
