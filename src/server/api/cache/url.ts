import { injectable } from 'inversify'
import { redirectClient } from '../../redis'
import { logger, redirectExpiry } from '../../config'
import { NotFoundError } from '../../util/error'

export interface UrlCache {
  /**
   * Looks up the longUrl from the cache.
   * @param {string} shortUrl
   * @returns {Promise<string>}
   * @throws {NotFoundError}
   */
  getLongUrlFromCache: (shortUrl: string) => Promise<string>

  /**
   * Cache a link.
   * @param shortUrl The short link.
   * @param longUrl The long URL.
   * @throws {Error}
   */
  cacheShortUrl: (shortUrl: string, longUrl: string) => Promise<void>
}

/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["getLongUrlFromCache", "cacheShortUrl"] }] */
@injectable()
export class UrlCacheRedis implements UrlCache {
  getLongUrlFromCache(shortUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      redirectClient.get(shortUrl, (cacheError, cacheLongUrl) => {
        if (cacheError) {
          logger.error(`Cache lookup failed unexpectedly:\t${cacheError}`)
          reject(cacheError)
        } else {
          if (!cacheLongUrl) {
            reject(
              new NotFoundError(
                `longUrl not found in cache:\tshortUrl=${shortUrl}`,
              ),
            )
          }
          resolve(cacheLongUrl)
        }
      })
    })
  }

  cacheShortUrl(shortUrl: string, longUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      redirectClient.set(shortUrl, longUrl, 'EX', redirectExpiry, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
