export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  redirectType: RedirectType
}

export enum RedirectType {
  Direct,
  TransitionPage,
}
