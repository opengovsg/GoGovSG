/* eslint-disable class-methods-use-this */
import Express from 'express'
import { injectable } from 'inversify'
import { sentryDns } from '../../config'

@injectable()
export class SentryController {
  getSentryDns(_: Express.Request, res: Express.Response) {
    res.send(sentryDns)
    return
  }
}

export default SentryController
