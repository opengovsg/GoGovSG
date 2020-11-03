import Express from 'express'

export interface DirectoryControllerInterface {
  /**
   * Controller for plain text search on urls.
   * @param  {Express.Request} req Express request.
   * @param  {Express.Response} res Express response.
   * @returns Empty promise that resolves when the request has been processed.
   */
  getDirectoryWithConditions(
    req: Express.Request,
    res: Express.Response,
  ): Promise<void>
}
