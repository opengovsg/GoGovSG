/* eslint-disable class-methods-use-this */
import Express from 'express'
import { injectable } from 'inversify'
import { RotatingLinksControllerInterface } from './interfaces/RotatingLinksControllerInterface'
import { linksToRotate } from '../config'

@injectable()
export class RotatingLinksController
  implements RotatingLinksControllerInterface {
  getRotatingLinks(_: Express.Request, res: Express.Response): void {
    res.send(linksToRotate)
  }
}

export default RotatingLinksController
