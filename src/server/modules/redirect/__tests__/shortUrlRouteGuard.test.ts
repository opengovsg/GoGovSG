import express from 'express'
import request from 'supertest'

import { shortUrlRouteGuard } from '../shortUrlRouteGuard.js'

function buildTestApp() {
  const app = express()
  app.get('/:shortUrl', shortUrlRouteGuard, (req, res) => {
    res.status(200).json({ shortUrl: req.params.shortUrl })
  })
  app.use((_req, res) => {
    res.status(404).send('not found')
  })
  return app
}

describe('shortUrlRouteGuard', () => {
  const app = buildTestApp()

  it('accepts a plain alphanumeric short url', async () => {
    const res = await request(app).get('/abc123')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'abc123' })
  })

  it('accepts uppercase letters and hyphens', async () => {
    const res = await request(app).get('/ABC-123')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'ABC-123' })
  })

  it('strips a single trailing dot', async () => {
    const res = await request(app).get('/abc123.')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'abc123' })
  })

  it('falls through to the 404 handler for a double trailing dot', async () => {
    const res = await request(app).get('/abc123..')
    expect(res.status).toBe(404)
  })

  it('falls through to the 404 handler for invalid characters', async () => {
    const res = await request(app).get('/abc_123')
    expect(res.status).toBe(404)
  })

  it('does not match a multi-segment path', async () => {
    const res = await request(app).get('/abc/def')
    expect(res.status).toBe(404)
  })
})

// Regression coverage for a bug where malformed percent-encoded path
// segments (e.g. `/%`) 500'd instead of 404'ing. Express's router calls
// decodeURIComponent on the matched `:shortUrl` segment *before* any route
// handler — including shortUrlRouteGuard itself — ever runs, and throws a
// URIError straight into Express's error-handling middleware on malformed
// input. That means this bug can only be exercised by hitting a real route
// through `request(app)`, not by calling shortUrlRouteGuard directly: the
// guard is never invoked at all when the bug fires.
function buildTestAppWithErrorHandler() {
  const app = express()
  app.get('/:shortUrl', shortUrlRouteGuard, (req, res) => {
    res.status(200).json({ shortUrl: req.params.shortUrl })
  })
  app.use((_req, res) => {
    res.status(404).send('not found')
  })
  // Mirrors the URIError-to-404 handling in the real errorHandler
  // (src/server/index.ts): a URIError here means Express's router failed
  // to decode a malformed percent-encoded path segment before any route
  // handler ran, so treat it the same as an unmatched short URL.
  const errorHandler: express.ErrorRequestHandler = (err, req, res, _next) => {
    if (err instanceof URIError) {
      res.status(404).send('not found')
      return
    }
    res.status(500).send('error')
  }
  app.use(errorHandler)
  return app
}

describe('shortUrlRouteGuard with URIError-handling error middleware', () => {
  const app = buildTestAppWithErrorHandler()

  it.each(['/%', '/abc%', '/%zz', '/%c0%af'])(
    'returns 404, not 500, for malformed percent-encoding %s',
    async (malformedPath) => {
      const res = await request(app).get(malformedPath)
      expect(res.status).toBe(404)
    },
  )
})
