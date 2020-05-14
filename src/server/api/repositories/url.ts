import { injectable } from 'inversify'
import { Url } from '../../models/url'
import { ACTIVE } from '../../models/types'
import { NotFoundError } from '../../util/error'

export interface UrlRepository {
  /**
   * Looks up the longUrl from the database given a short link.
   * @param {string} shortUrl
   * @returns {Promise<string>}
   * @throws {NotFoundError}
   */
  getLongUrlFromDatabase: (shortUrl: string) => Promise<string>

  /**
   * Asynchronously increment the number of clicks in the database.
   * @param shortUrl
   */
  incrementClick: (shortUrl: string) => Promise<void>
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["getLongUrlFromDatabase", "incrementClick"] }] */
export class UrlRepositorySequelize implements UrlRepository {
  getLongUrlFromDatabase(shortUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Url.findOne({
        where: {
          shortUrl,
          state: ACTIVE,
        },
      }).then((url) => {
        if (!url) {
          reject(
            new NotFoundError(
              `longUrl not found in database:\tshortUrl=${shortUrl}`,
            ),
          )
        } else {
          resolve(url.longUrl)
        }
      })
    })
  }

  incrementClick(shortUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Url.findOne({ where: { shortUrl } }).then((url) => {
        if (url) {
          url
            .increment('clicks')
            .then(() => resolve())
            .catch((error) => reject(error))
        }
      })
    })
  }
}
