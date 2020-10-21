/* eslint-disable class-methods-use-this */
import Express from 'express'
import { injectable } from 'inversify'
import { gaTrackingId } from '../config'
import { GaControllerInterface } from './interfaces/GaControllerInterface'

@injectable()
export class GaController implements GaControllerInterface {
  getGaId(_: Express.Request, res: Express.Response) {
    res.send(gaTrackingId)
    return
  }
}

export default GaController
