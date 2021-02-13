import Express from 'express'
import { injectable } from 'inversify'
import jsonMessage from '../../util/json'

@injectable()
export class LogoutController {
  public logOut: (req: Express.Request, res: Express.Response) => void = (
    req,
    res,
  ) => {
    if (!req.session) {
      res.serverError(jsonMessage('No session found'))
      return
    }
    req.session.destroy(() => res.ok(jsonMessage('Logged out')))
  }
}

export default LogoutController
