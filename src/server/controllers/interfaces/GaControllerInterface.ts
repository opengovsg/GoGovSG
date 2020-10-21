import Express from 'express'

export interface GaControllerInterface {
  /**
   * Requests for the Google Analytics ID.
   */
  getGaId(req: Express.Request, res: Express.Response): void
}
