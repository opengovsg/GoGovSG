import Express from 'express'
import { LogoutControllerInterface } from './interfaces/LogoutControllerInterface'
import jsonMessage from '../util/json'

export class LogoutController implements LogoutControllerInterface {
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
