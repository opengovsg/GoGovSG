import express from 'express'
import rateLimit from 'express-rate-limit'
import { logger, otpRateLimit } from '../config.js'

function getIp(req: express.Request) {
  // Note: headers are case insensitive: https://stackoverflow.com/questions/5258977/are-http-headers-case-sensitive

  /**
   * On staging and production, we use CloudFlare which adds a CF-Connecting-IP
   * header with every request which contains only the origin IP
   * https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-CloudFlare-handle-HTTP-Request-headers-.
   */
  const connectingIp = req.header('CF-Connecting-IP')
  // string? to string type-guard
  if (connectingIp) {
    return connectingIp
  }

  /**
   * If CF-Connecting-IP isn't present, we use req.ip.
   * This is automatically parsed from the x-forwarded-for
   * header if we configure app.set('trust proxy').
   */
  return req.ip
}

/**
 * Per-IP rate limiter shared by the login entry points.
 */
export const ipRateLimiter = (label: string) =>
  rateLimit({
    keyGenerator: (req) => getIp(req) as string,
    // `onLimitReached` was removed in express-rate-limit v6; `handler` would
    // have to also replicate the default 429 response, so the warn log below
    // now happens on every rejected request instead (via `handler`), rather
    // than only on the first one that crosses the limit.
    handler: (req, res, _next, options) => {
      logger.warn(`Rate limit (${label}) reached for IP Address: ${getIp(req)}`)
      res.status(options.statusCode).send(options.message)
    },
    // `max: 0` disabled rate limiting entirely on v5 and earlier, but v7+
    // flipped that to block every request instead, so `otpRateLimit = 0`
    // (dev/test) must skip the limiter explicitly to keep that behaviour.
    skip: () => otpRateLimit <= 0,
    windowMs: 60000, // 1 minute
    max: otpRateLimit,
  })

export default getIp
