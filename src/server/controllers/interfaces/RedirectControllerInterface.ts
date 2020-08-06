import Express from 'express'

export interface RedirectControllerInterface {
  /**
   * Renders Google Tag Manager script for transition page.
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   */
  gtagForTransitionPage(
    req: Express.Request,
    res: Express.Response,
  ): Promise<void>

  /**
   * The redirect function.
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   */
  redirect(req: Express.Request, res: Express.Response): Promise<void>
}
