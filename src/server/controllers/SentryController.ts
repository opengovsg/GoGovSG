/* eslint-disable class-methods-use-this */
import Express from 'express'
import { injectable } from 'inversify'
import { sentryDns } from '../config'
import { SentryControllerInterface } from './interfaces/SentryControllerInterface'

@injectable()
export class SentryController implements SentryControllerInterface {
  getSentryDns(_: Express.Request, res: Express.Response) {
    res.send(sentryDns)
  }
}

export default SentryController
