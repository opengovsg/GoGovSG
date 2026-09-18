import express from 'express'
import request from 'supertest'
import { z } from 'zod'

import { createValidator } from '../../util/zodValidator.js'

function buildTestApp() {
  const app = express()
  const validator = createValidator()
  const schema = z.object({
    offset: z.coerce.number().min(0).optional(),
  })

  app.get('/search', validator.query(schema), (req, res) => {
    res.status(200).json({ offset: req.query.offset })
  })

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(500).json({ error: err.message })
    },
  )

  return app
}

describe('zod query validation under Express 5', () => {
  it('validates the query string without crashing the request', async () => {
    const app = buildTestApp()
    const res = await request(app).get('/search?offset=10')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ offset: 10 })
  })
})
