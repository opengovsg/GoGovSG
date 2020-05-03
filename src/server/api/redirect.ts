import Express from 'express'
import { redirectClient } from '../redis'
import { Url } from '../models'
import { ACTIVE } from '../models/types'
import { gaTrackingId, logger, redirectExpiry } from '../config'
import { generateCookie, sendPageViewHit } from '../util/ga'
import { NotFoundError } from '../util/error'

const error404Path = '404.error.ejs'

/**
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {String} shortUrl Short url of link.
 * @param {String} longUrl  Long url of link.
 */
function gaLogging(req: Express.Request, res:Express.Response, shortUrl: string, longUrl: string): void {
  const cookie = generateCookie(req)
  if (cookie) {
    res.cookie(...cookie)
  }
  sendPageViewHit(req, shortUrl, longUrl)
}

/**
 * Looks up the longUrl from the cache.
 * @param {string} shortUrl 
 * @returns {Promise<string>}
 * @throws {NotFoundError}
 */
function getLongUrlFromCache (shortUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    redirectClient.get(shortUrl, (cacheError, cacheLongUrl) => {
      if (cacheError) {
        logger.error(`Cache lookup failed unexpectedly:\t${cacheError}`)
        reject(cacheError)
      } else {
        if (!cacheLongUrl) {
          reject(new NotFoundError(`longUrl not found in cache:\tshortUrl=${shortUrl}`))
        }
        resolve(cacheLongUrl)
      }
    })
  })
}

/**
 * Looks up the longUrl from the database given a short link
 * @param {string} shortUrl
 * @returns {Promise<string>}
 * @throws {NotFoundError}
 */
function getLongUrlFromDatabase (shortUrl: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    Url.findOne({
      where: {
        shortUrl,
        state: ACTIVE,
      },
    }).then((url) => {
      if (!url) {
        reject(new NotFoundError(`longUrl not found in database:\tshortUrl=${shortUrl}`))
      } else {
        resolve(url.longUrl)
      }
    })
  })
}

/**
 * Cache a link in Redis
 * @param shortUrl The short link
 * @param longUrl The long URL
 * @throws {Error}
 */
function cacheShortUrl (shortUrl: string, longUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    redirectClient.set(shortUrl, longUrl, 'EX', redirectExpiry, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * Looks up the longUrl given a shortUrl from the cache, falling back
 * to the database. The cache is re-populated if the database lookup is
 * performed successfully.
 * @param {string} shortUrl 
 * @returns {Promise<string>}
 * @throws {NotFoundError}
 */
async function getLongUrlFromStore (shortUrl: string): Promise<string> {
  try {
    // Cache lookup
    return await getLongUrlFromCache(shortUrl)
  } catch {
    // Cache failed, look in database
    const longUrl = await getLongUrlFromDatabase(shortUrl)
    try {
      cacheShortUrl(shortUrl, longUrl)
    } catch (err) {
      logger.error(err)
    }
    return longUrl
  }
}

/**
 * Asynchronously increment the number of clicks in the database
 * @param shortUrl 
 */
function incrementClick (shortUrl: string): void {
  Url.findOne({ where: { shortUrl } }).then((url) => {
    if (url) {
      url.increment('clicks')
    }
  })
}

/**
 * The redirect function
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 */
export default async function redirect(req: Express.Request, res: Express.Response) {
  let { shortUrl } = req.params

  // Short link must consist of valid characters
  if (!shortUrl || !/^[a-zA-Z0-9-]+$/.test(shortUrl)) {
    res.status(404).render(error404Path, { shortUrl })
    return
  }
  shortUrl = shortUrl.toLowerCase()

  try {
    // Find longUrl to redirect to
    const longUrl = await getLongUrlFromStore(shortUrl)

    // Update clicks in database
    incrementClick(shortUrl)

    // Google analytics
    if (gaTrackingId) gaLogging(req, res, shortUrl, longUrl)

    // Redirect
    return res.status(302).redirect(longUrl)
  } catch (error) {

    if (!(error instanceof NotFoundError))
      logger.error(`Redirect error: ${error} ${error instanceof NotFoundError}`)

    return res.status(404).render(error404Path, { shortUrl })
  }
}
