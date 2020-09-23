import { get } from './requests'

describe('GET: /api/links', () => {
  it('positive test: Should return a string', async (done) => {
    const response = await get('/api/links')
    expect(response.status).toBe(200)
    expect(typeof response.data).toBe('string')

    done()
  })
})
