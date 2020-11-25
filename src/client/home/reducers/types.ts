export type HomeStatistics = {
  userCount: number
  linkCount: number
  clickCount: number
}

export type LinksToRotate = Array<string>

export type HomeState = {
  statistics: HomeStatistics
  linksToRotate?: LinksToRotate
}
