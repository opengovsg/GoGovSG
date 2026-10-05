import Express from 'express'
import { injectable } from 'inversify'
import jsonMessage from '../../util/json.js'

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
    // Read before destroy: the client tells one.gov.sg users that their
    // one.gov.sg session is still active.
    const oneGovSg = !!req.session.oneGovSg
    req.session.destroy(() =>
      res.ok({ ...jsonMessage('Logged out'), oneGovSg }),
    )
  }
}

export default LogoutController
