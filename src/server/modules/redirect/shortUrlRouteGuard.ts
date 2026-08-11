import { NextFunction, Request, Response } from 'express'

const VALID_SHORT_URL = /^[a-zA-Z0-9-]+$/

/**
 * Reproduces the matching behaviour of the pre-Express-5 route path
 * `/:shortUrl([a-zA-Z0-9-]+).?` in application code. path-to-regexp v8
 * (bundled with Express 5's router) removed inline per-parameter custom
 * regex and the bare `?` optional-suffix token entirely, so this can no
 * longer be expressed as a route-path string at all. A single trailing
 * literal dot is still accepted (as it was before); anything else that
 * isn't `[a-zA-Z0-9-]+` falls through to the app's 404 handler exactly as
 * it did when the route path itself failed to match.
 */
export function shortUrlRouteGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const { shortUrl } = req.params
  const withoutTrailingDot = shortUrl.endsWith('.')
    ? shortUrl.slice(0, -1)
    : shortUrl

  if (!VALID_SHORT_URL.test(withoutTrailingDot)) {
    next('route')
    return
  }

  req.params.shortUrl = withoutTrailingDot
  next()
}

export default shortUrlRouteGuard
