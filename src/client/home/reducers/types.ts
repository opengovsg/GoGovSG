export type HomeStatistics = {
  userCount: number | null
  linkCount: number | null
  clickCount: number | null
}

export type LinksToRotate = Array<string>

export type HomeState = {
  statistics: HomeStatistics
  linksToRotate?: LinksToRotate
}
