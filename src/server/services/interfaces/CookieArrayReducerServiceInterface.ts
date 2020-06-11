export interface CookieArrayReducerServiceInterface {
  userHasVisitedShortlink: (
    cookie: string[] | null,
    shortUrl: string,
  ) => boolean

  writeShortlinkToCookie: (
    cookie: string[] | null,
    shortUrl: string,
  ) => string[]
}
