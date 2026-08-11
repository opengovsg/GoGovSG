import express from 'express'
import request from 'supertest'

import jsonMessage from '../json.js'
import handleUriError from '../handleUriError.js'
import '../response.js'

function buildTestApp() {
  const app = express()

  const apiRouter = express.Router()
  apiRouter.patch('/urls/:shortUrl', (req, res) => {
    res.json({ shortUrl: req.params.shortUrl })
  })
  apiRouter.use((_, res) => {
    res.status(404).send(jsonMessage('Resource not found.'))
  })

  app.use('/api/v1', apiRouter)
  app.get('/:shortUrl', (_req, res) => {
    res.status(200).send('redirect')
  })
  app.use((_req, res) => {
    res.status(404).send('catch-all 404')
  })
  app.use((err, req, res, _next) => {
    if (err instanceof URIError) {
      handleUriError(req, res)
      return
    }
    res.status(500).send('error')
  })

  return app
}

describe('handleUriError', () => {
  describe('unit', () => {
    it('returns 400 JSON for API paths', () => {
      const req = { path: '/api/v1/urls/%zz' } as express.Request
      const res = {
        badRequest: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as unknown as express.Response

      handleUriError(req, res)

      expect(res.badRequest).toHaveBeenCalledWith(
        jsonMessage('Malformed URL'),
      )
      expect(res.status).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders the redirect 404 page for non-API paths', () => {
      const req = { path: '/%zz' } as express.Request
      const res = {
        badRequest: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as unknown as express.Response

      handleUriError(req, res)

      expect(res.badRequest).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.render).toHaveBeenCalledWith(
        '404.error.ejs',
        expect.objectContaining({ shortUrl: '%zz' }),
      )
    })
  })

  describe('integration with Express 5 path param decoding', () => {
    const app = buildTestApp()

    it('returns 400 JSON for malformed encoding on API path-param routes', async () => {
      const res = await request(app).patch('/api/v1/urls/%zz')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Malformed URL' })
      expect(res.headers['content-type']).toMatch(/json/)
    })

    it.each(['/%', '/abc%', '/%zz', '/%c0%af'])(
      'returns 404, not 500, for malformed encoding on redirect paths %s',
      async (malformedPath) => {
        const res = await request(app).get(malformedPath)

        expect(res.status).toBe(404)
        expect(res.status).not.toBe(500)
      },
    )
  })
})
