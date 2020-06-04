import Express from 'express'
import jsonMessage from '../../util/json'

export function logOut(req: Express.Request, res: Express.Response) {
  if (req.session) {
    req.session.destroy(() => res.ok(jsonMessage('Logged out')))
    return
  }
  res.serverError(jsonMessage('No session found'))
}

export default logOut
