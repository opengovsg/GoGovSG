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
