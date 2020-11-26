import { RedirectController } from './RedirectController'

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

export default RedirectController
