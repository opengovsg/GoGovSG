import { get } from './requests'

describe('GET: /api/stats', () => {
  it('positive test: Should obtain statistics', async (done) => {
    const res = await get('/api/stats')
    expect(res.status).toBe(200)
    expect(Object.keys(res.data).sort()).toEqual(
      ['linkCount', 'clickCount', 'userCount'].sort(),
    )
    done()
  })
})
