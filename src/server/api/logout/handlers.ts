import Express from 'express'
import jsonMessage from '../../util/json'

export function logOut(req: Express.Request, res: Express.Response) {
  if (!req.session) {
    res.serverError(jsonMessage('No session found'))
    return
  }
  req.session.destroy(() => res.ok(jsonMessage('Logged out')))
}

export default logOut
