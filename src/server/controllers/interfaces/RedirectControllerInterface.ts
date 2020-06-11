import Express from 'express'

export interface RedirectControllerInterface {
  /**
   * The redirect function.
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   */
  redirect(req: Express.Request, res: Express.Response): Promise<void>
}
