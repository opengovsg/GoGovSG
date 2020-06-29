import Express from 'express'

export interface SearchControllerInterface {
  urlSearchPlainText(req: Express.Request, res: Express.Response): Promise<void>
}
