import { get } from './requests'

describe('GET: /api/sentry', () => {
  it('positive test: Should pass', async (done) => {
    const res = await get('/api/sentry')
    expect(res.status).toBe(200)
    done()
  })
})
