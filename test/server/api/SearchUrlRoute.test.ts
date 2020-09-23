import { get } from './requests'

describe('GET: /api/search/urls', () => {
  it('positive test: Should pass and expect results', async (done) => {
    const limit = 10
    const offset = 0
    const query = 'test'
    const order = 'relevance'
    const queryString = `/api/search/urls?query=${query}&order=${order}&limit=${limit}&offset=${offset}`
    const response = await get(queryString)
    expect(response.status).toBe(200)
    expect(response.data).toMatchObject(
      expect.objectContaining({
        urls: expect.any(Array),
        count: expect.any(Number),
      }),
    )
    done()
  })
})
