import { NextFunction, Request, Response } from 'express'

const VALID_SHORT_URL = /^[a-zA-Z0-9-]+$/

/**
 * Reproduces the matching behaviour of the pre-Express-5 route path
 * `/:shortUrl([a-zA-Z0-9-]+).?` in application code, for well-formed input.
 * path-to-regexp v8 (bundled with Express 5's router) removed inline
 * per-parameter custom regex and the bare `?` optional-suffix token
 * entirely, so this can no longer be expressed as a route-path string at
 * all. A single trailing literal dot is still accepted (as it was before);
 * anything else that isn't `[a-zA-Z0-9-]+` falls through to the app's 404
 * handler exactly as it did when the route path itself failed to match.
 *
 * One behaviour is *not* reproduced exactly, and can't be from within this
 * guard: percent-encoded characters in the path segment are decoded by
 * Express's router (via `decodeURIComponent`) before this guard ever runs,
 * unlike the old regex-in-path route, which matched against the raw,
 * still-encoded segment. A malformed percent-encoding (e.g. `/%`, `/%zz`,
 * `/%c0%af`) makes that decode throw a `URIError` straight into Express's
 * error-handling middleware, so it never reaches this guard's `next('route')`
 * fallthrough — it's handled separately, in `errorHandler`
 * (`src/server/index.ts`), which renders the same 404 page.
 */
export function shortUrlRouteGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const { shortUrl } = req.params

  // A single named `:shortUrl` route param can never actually be an array
  // — arrays are only produced by wildcard `*` params — but Express 5's
  // types widen every `req.params` value to `string | string[]` to
  // account for those. Treat an array the same as any other non-matching
  // value.
  if (Array.isArray(shortUrl)) {
    next('route')
    return
  }

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
