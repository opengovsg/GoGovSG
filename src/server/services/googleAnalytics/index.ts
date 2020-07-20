import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { gaTrackingId, ogUrl } from '../../config'
import getIp from '../../util/request'
import IGaPageViewForm from './types/IGaPageViewForm'
import IGaCoreForm from './types/IGaCoreForm'
import { GaHitVariant } from './types/enum'

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
  cookie?: string,
): [string, string, { maxAge: number }] | null {
  // Get ga cookie from request headers cookie
  const { gaClientId } = parseCookies(cookie)

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

/**
 * Evaluates the common set of fields in the different hits.
 *
 * @param req The relevant request where the client id can be extracted.
 * @param type The type of hit to be sent.
 */
export function getCoreFields(req: express.Request, type: GaHitVariant) {
  // Do not submit if we don't have a GA account.
  if (!gaTrackingId) return null
  // Get client id (cid).
  const { gaClientId } = parseCookies(req.headers.cookie)
  // Compulsory as we do not supply uid.
  if (!gaClientId) return null

  const coreForm: IGaCoreForm = {
    v: 1, // Protocol version.
    tid: gaTrackingId as string, // Tracking id.
    cid: gaClientId, // Client id.
    t: type, // Hit type.
  }
  return coreForm
}

/**
 * Create a request to Google Analytics Measurement Protocol
 * of hit type 'pageview'.
 */
export function createPageViewHit(
  req: express.Request,
  shortUrl: string,
  longUrl: string,
) {
  const coreFields = getCoreFields(req, GaHitVariant.PAGE_VIEW)
  if (!coreFields) {
    return undefined
  }

  // Populate post data.
  const form: IGaPageViewForm = {
    ...coreFields,
    ds: 'web', // Data source.
    uip: getIp(req), // IP override
    ua: req.headers['user-agent'], // User agent override.
    dp: `/${shortUrl}`, // document path
    dh: ogUrl, // Document host name.
    dt: longUrl, // Document title.
    dr: req.headers.referer, // Document referrer.
  }

  // User language.
  if (req.headers['accept-language']) {
    ;[form.ul] = (req.headers['accept-language'] as string).split(',')
  }
  return form
}
