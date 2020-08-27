import generate from 'nanoid/async/generate'
import { CookieArrayReducerService } from '../../../src/server/services/CookieArrayReducerService'
import { cookieSessionMaxSizeBytes } from '../../../src/server/config'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const LENGTH = 6

async function generateShortUrl() {
  return generate(ALPHABET, LENGTH)
}

const service = new CookieArrayReducerService()

describe('CookieArrayReducerService', () => {
  const shortUrl = 'short-url'

  describe('userHasVisitedShortLink', () => {
    it('is false on null cookie array', () => {
      expect(service.userHasVisitedShortlink(null, shortUrl)).toBeFalsy()
    })

    it('is false on empty cookie array', () => {
      expect(service.userHasVisitedShortlink([], shortUrl)).toBeFalsy()
    })

    it('is false on cookie array without shortUrl', () => {
      expect(
        service.userHasVisitedShortlink(['shorter-url'], shortUrl),
      ).toBeFalsy()
    })

    it('is true on cookie array containing shortUrl', () => {
      expect(service.userHasVisitedShortlink([shortUrl], shortUrl)).toBeTruthy()
    })
  })

  describe('writeShortlinkToCookie', () => {
    it('returns array with shortUrl on null cookie', () => {
      expect(service.writeShortlinkToCookie(null, shortUrl)).toStrictEqual([
        shortUrl,
      ])
    })

    it('moves shortUrl to the end of cookie array', () => {
      const otherUrl = 'other-url'
      expect(
        service.writeShortlinkToCookie([shortUrl, otherUrl], shortUrl),
      ).toStrictEqual([otherUrl, shortUrl])
    })

    it('drops old links in cookie array to keep it small', async () => {
      const cookie = []
      while (cookie.toString().length <= cookieSessionMaxSizeBytes) {
        // eslint-disable-next-line no-await-in-loop
        cookie.push(await generateShortUrl())
      }
      const newCookie = [shortUrl]
      for (
        let i = cookie.length - 1;
        i >= 0 && newCookie.toString().length < cookieSessionMaxSizeBytes;
        i -= 1
      ) {
        newCookie.unshift(cookie[i])
      }
      expect(service.writeShortlinkToCookie(cookie, shortUrl)).toStrictEqual(
        newCookie,
      )
    })
  })
})
