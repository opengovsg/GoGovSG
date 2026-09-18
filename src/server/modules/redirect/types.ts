export enum RedirectType {
  Direct,
  TransitionPage,
}

export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  redirectType: RedirectType
}
