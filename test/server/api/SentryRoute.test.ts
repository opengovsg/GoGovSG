import request from 'supertest'

// Importing setup app
import app from './setup'

describe('GET: /api/sentry', () => {
  test('positive test: Should get sentry url', async (done) => {
    const res = await request(app).get('/api/sentry')
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(res.text).toBe('mocksentry.com')
    done()
  })
})
