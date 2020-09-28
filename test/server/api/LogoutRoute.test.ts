import request from 'supertest'

// Importing setup app
import app from './setup'

describe('GET /api/logout', () => {
  test('notify logout', async (done) => {
    const res = await request(app).get('/api/logout').set('prime', '1')
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(res.body.message).toBe('Logged out')
    done()
  })
})
