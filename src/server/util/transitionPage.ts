import _ from 'lodash'
import { injectable } from 'inversify'

/**
 * Herein contains utility functions pertaining to
 * the functionality of the transition page.
 */

const MAX_SIZE_BYTES = 2000

/**
 * Utility functions to store and read a user's visit
 * history in the browser cookie.
 */
export interface CookieReducer {
  userHasVisitedShortlink: (
    cookie: string[] | null,
    shortUrl: string,
  ) => boolean

  writeShortlinkToCookie: (
    cookie: string[] | null,
    shortUrl: string,
  ) => string[]
}

/**
 * Array implementation of a cookie reducer which tracks an
 * ordered list of shortUrls. Eviction policy is based on a
 * least-recently-used policy denoted by the first element of
 * the list.
 */
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["userHasVisitedShortlink", "writeShortlinkToCookie"] }] */
@injectable()
export class CookieArrayReducer implements CookieReducer {
  userHasVisitedShortlink(
    cookie: string[] | null,
    shortUrl: string,
  ): boolean {
    if (!cookie) return false
    return cookie.includes(shortUrl)
  }

  writeShortlinkToCookie(
    cookie: string[] | null,
    shortUrl: string,
  ): string[] {
    if (!cookie) return [shortUrl]
    if (this.userHasVisitedShortlink(cookie, shortUrl)) {
      return _.without(cookie, shortUrl).concat(shortUrl)
    }
    let newCookie = _.concat(cookie, shortUrl)
    while (newCookie.toString().length > MAX_SIZE_BYTES) {
      newCookie = _.drop(newCookie)
    }
    return newCookie
  }
}
