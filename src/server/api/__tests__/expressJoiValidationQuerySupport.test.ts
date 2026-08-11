import express from 'express'
import request from 'supertest'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'

function buildTestApp() {
  const app = express()
  const validator = createValidator()
  const schema = Joi.object({
    offset: Joi.number().min(0),
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

describe('express-joi-validation query support under the installed Express version', () => {
  it('validates the query string without crashing the request', async () => {
    const app = buildTestApp()
    const res = await request(app).get('/search?offset=10')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ offset: 10 })
  })
})
