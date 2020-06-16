import Express from 'express'

export interface LoginControllerInterface {
  getLoginMessage(req: Express.Request, res: Express.Response): void
  getEmailDomains(req: Express.Request, res: Express.Response): void
  generateOtp(req: Express.Request, res: Express.Response): Promise<void>
  verifyOtp(req: Express.Request, res: Express.Response): Promise<void>
  getIsLoggedIn(req: Express.Request, res: Express.Response): void
}
