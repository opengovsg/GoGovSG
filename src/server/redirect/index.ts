import express from 'express'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../constants'
import { RedirectControllerInterface } from '../controllers/interfaces/RedirectControllerInterface'

@injectable()
export class Redirect {
  readonly router: express.Router

  constructor(
    @inject(DependencyIds.redirectController)
    redirectController: RedirectControllerInterface,
  ) {
    this.router = express.Router()
    this.router.get(
      '/assets/transition-page/js/redirect.js',
      redirectController.gtagForTransitionPage,
    )
    this.router.get('/:shortUrl([a-zA-Z0-9-]+).?', redirectController.redirect)
  }
}

export default Redirect
