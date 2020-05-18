import express from 'express'
import uuidv4 from 'uuid/v4'
import request from 'request'
import { gaTrackingId, logger, ogUrl } from '../config'
import getIp from './request'

type CookieData = {
  [_: string]: string
}

/**
 * Parse cookie string to an object.
 */
function parseCookies(cookie: string | undefined): CookieData {
  if (!cookie) return {}
  const ck: CookieData[] = cookie.split(';').map((c) => {
    const [key, val] = c.trim().split('=')
    return { [key]: val }
  })
  return Object.assign({}, ...ck)
}

/**
 * Return an array with cookie settings if cookie is not set.
 * Else return null.
 */
export function generateCookie(
  req: express.Request,
): [string, string, { maxAge: number }] | null {
  // Get ga cookie from request headers cookie
  const { gaClientId } = parseCookies(req.headers.cookie)

  // if cookie is not found, set the cookie
  if (!gaClientId) {
    return [
      'gaClientId',
      uuidv4(),
      {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year expiry
      },
    ]
  }
  return null
}

interface GaSubmissionForm {
  v: number
  tid: string
  t: string
  ds: string
  uip: string | undefined
  ua: string | undefined
  dp: string
  dh: string | undefined
  dt: string
  dr: string | undefined
  cid: string
  ul?: string
}

/**
 * Send POST request to Google Analytics Measurement Protocol
 * of hit type 'pageview'.
 */
export function sendPageViewHit(
  req: express.Request,
  shortUrl: string,
  longUrl: string,
) {
  // Do not submit if we don't have a GA account
  if (!gaTrackingId) return

  // client id (cid)
  const { gaClientId } = parseCookies(req.headers.cookie)
  if (!gaClientId) return // compulsory as we do not supply uid

  // Populate post data
  const form: GaSubmissionForm = {
    v: 1, // protocol version
    tid: gaTrackingId as string, // tracking id
    t: 'pageview', // hit type
    ds: 'web', // data source
    uip: getIp(req), // IP override
    ua: req.headers['user-agent'], // user agent override
    dp: `/${shortUrl}`, // document path
    dh: ogUrl, // document host name,
    dt: longUrl, // document title
    dr: req.headers.referer, // document referrer
    cid: gaClientId,
  }

  // user language
  if (req.headers['accept-language']) {
    ;[form.ul] = (req.headers['accept-language'] as string).split(',')
  }

  request.post(
    'https://www.google-analytics.com/collect',
    { form },
    (err, httpResponse, body) => {
      if (err) {
        logger.error(
          `GA tracking failure:\tError: ${err}\thttpResponse: ${httpResponse}\t body:${body}`,
        )
      }
    },
  )
}
