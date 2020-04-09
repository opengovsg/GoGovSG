import Express from 'express'
import { redirectClient } from '../redis'
import { Url } from '../models'
import { ACTIVE } from '../models/types'
import { gaTrackingId, logger, redirectExpiry } from '../config'
import { generateCookie, sendPageViewHit } from '../util/ga'

const error404Path = '404.error.ejs'

/**
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {String} shortUrl Short url of link.
 * @param {String} longUrl  Long url of link.
 */
function gaLogging(req: Express.Request, res:Express.Response, shortUrl: string, longUrl: string) {
  const cookie = generateCookie(req)
  if (cookie) {
    res.cookie(...cookie)
  }
  sendPageViewHit(req, shortUrl, longUrl)
}

/**
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 */
async function redirect(req: Express.Request, res: Express.Response) {
  let { shortUrl } = req.params

  // Short link must consist of valid characters
  if (!shortUrl || !/^[a-zA-Z0-9-]+$/.test(shortUrl)) {
    res.status(404).render(error404Path, { shortUrl })
    return
  }
  shortUrl = shortUrl.toLowerCase()
  // Check if cache contains value
  redirectClient.get(shortUrl, (cacheError, cacheLongUrl) => {
    if (cacheError) {
      // Log and fallback to database
      logger.error(`Access to redirect cache failed unexpectedly:\t${cacheError}`)
    } else if (cacheLongUrl) {
      if (gaTrackingId) gaLogging(req, res, shortUrl, cacheLongUrl)

      // Redirect using cached value
      res.status(302).redirect(cacheLongUrl)

      // Update clicks in database
      Url.findOne({ where: { shortUrl } }).then((url) => {
        if (url) {
          url.increment('clicks')
        }
      })
    } else {
      // Not cached, look in database
      Url.findOne({
        where: {
          shortUrl,
          state: ACTIVE,
        },
      }).then((url) => {
        // No such URL
        if (!url) {
          res.status(404).render(error404Path, { shortUrl })
        } else {
          if (gaTrackingId) gaLogging(req, res, shortUrl, url.longUrl)
          // Redirect user
          res.status(302).redirect(url.longUrl)

          // Update clicks in database
          url.increment('clicks')

          // Cache URL
          redirectClient.set(shortUrl, url.longUrl, 'EX', redirectExpiry)
        }
      })
    }
  })
}

export default redirect
