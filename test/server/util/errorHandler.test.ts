import path from 'path'
import express from 'express'
import request from 'supertest'

import errorHandler from '../../../src/server/util/errorHandler'

const HTTP_RANGE_NOT_SATISFIABLE = 416
const HTTP_INTERNAL_SERVER_ERROR = 500

function buildTestApp() {
  const app = express()
  app.set('views', path.resolve(__dirname, '../../../src/server/views'))
  app.set('view engine', 'ejs')

  // Serves this directory, so this test file doubles as the static fixture.
  app.use(express.static(__dirname))
  app.get('/throw', () => {
    throw new Error('boom')
  })
  app.use(errorHandler)

  return app
}

describe('errorHandler', () => {
  const app = buildTestApp()

  it('returns 416, not 500, for a Range past the end of a static file', async () => {
    const res = await request(app)
      .get(`/${path.basename(__filename)}`)
      .set('Range', 'bytes=999999-')

    expect(res.status).toBe(HTTP_RANGE_NOT_SATISFIABLE)
  })

  it('returns 500 for a plain Error', async () => {
    const res = await request(app).get('/throw')

    expect(res.status).toBe(HTTP_INTERNAL_SERVER_ERROR)
  })
})
