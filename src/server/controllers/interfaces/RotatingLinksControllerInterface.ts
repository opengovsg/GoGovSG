import Express from 'express'

export interface RotatingLinksControllerInterface {
  getRotatingLinks(req: Express.Request, res: Express.Response): void
}
