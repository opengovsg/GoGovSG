import request from 'supertest'

// Importing setup app
import app from './setup'

describe('GET /api/links', () => {
  test('get default links', async (done) => {
    const res = await request(app).get('/api/links')
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(res.text).toBe('testlink1,testlink2,testlink3')
    done()
  })
})
