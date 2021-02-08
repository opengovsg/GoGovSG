/* eslint-disable class-methods-use-this */
import Express from 'express'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../constants'

@injectable()
export class GaController {
  private gaTrackingId: string

  constructor(@inject(DependencyIds.gaTrackingId) gaTrackingId: string) {
    this.gaTrackingId = gaTrackingId
  }

  getGaId = (_: Express.Request, res: Express.Response) => {
    res.send(this.gaTrackingId)
    return
  }
}

export default GaController
