export type HomeStatistics = {
  userCount: number | null
  linkCount: number | null
  clickCount: number | null
}

export type HomeState = {
  statistics: HomeStatistics
  linksToRotate?: LinksToRotate
}

export type LinksToRotate = Array<string>
