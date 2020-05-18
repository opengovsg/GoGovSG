import _ from 'lodash'
import { injectable } from 'inversify'
import { cookieSessionMaxSizeBytes } from '../config'

/**
 * Herein contains utility functions pertaining to
 * the functionality of the transition page.
 */

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
