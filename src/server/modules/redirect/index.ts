import express from 'express'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../../constants'
import { RedirectController } from './RedirectController'

@injectable()
export class Redirect {
  readonly router: express.Router

  constructor(
    @inject(DependencyIds.redirectController)
    redirectController: RedirectController,
  ) {
    this.router = express.Router()
    this.router.get(
      '/assets/transition-page/js/redirect.js',
      redirectController.gtagForTransitionPage,
    )
    this.router.get('/:shortUrl([a-zA-Z0-9-]+).?', redirectController.redirect)
  }
}
export enum RedirectType {
  Direct,
  TransitionPage,
}

export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  redirectType: RedirectType
}

export { RedirectController } from './RedirectController'

export default Redirect
