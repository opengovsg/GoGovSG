import Express from 'express'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../constants'

@injectable()
export class RotatingLinksController {
  private linksToRotate?: string

  constructor(@inject(DependencyIds.linksToRotate) linksToRotate?: string) {
    this.linksToRotate = linksToRotate
  }

  getRotatingLinks: (_: Express.Request, res: Express.Response) => void = (
    _,
    res,
  ) => {
    res.send(this.linksToRotate)
  }
}

export default RotatingLinksController
