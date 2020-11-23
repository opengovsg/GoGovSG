import _ from 'lodash'
import { injectable } from 'inversify'
import { cookieSessionMaxSizeBytes } from '../../config'

/**
 * Array implementation of a cookie reducer which tracks an
 * ordered list of shortUrls. Eviction policy is based on a
 * least-recently-used policy denoted by the first element of
 * the list.
 */
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["userHasVisitedShortlink", "writeShortlinkToCookie"] }] */
@injectable()
export class CookieArrayReducerService {
  userHasVisitedShortlink(cookie: string[] | null, shortUrl: string): boolean {
    if (!cookie) return false
    return cookie.includes(shortUrl)
  }

  writeShortlinkToCookie(cookie: string[] | null, shortUrl: string): string[] {
    if (!cookie) return [shortUrl]
    if (cookie.includes(shortUrl)) {
      return _.without(cookie, shortUrl).concat(shortUrl)
    }
    let newCookie = _.concat(cookie, shortUrl)
    while (newCookie.toString().length > cookieSessionMaxSizeBytes) {
      newCookie = _.drop(newCookie)
    }
    return newCookie
  }
}

export default CookieArrayReducerService
