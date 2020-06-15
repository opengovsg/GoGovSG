import Express from 'express'

export interface SentryControllerInterface {
  /**
   * Requests for the Sentry DNS.
   */
  getSentryDns(req: Express.Request, res: Express.Response): void
}
