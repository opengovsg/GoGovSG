import { getWithCookie, post, postWithCookie } from './requests'

const email = 'go.gov@open.gov.sg'
const otp = '111111'

const opts = {
  email,
}

const verifyOpts = {
  email,
  otp,
}

const shortUrl =
  '665eb7790b89d17defa57693128b33814acdde0f7592a4584fca392e6ca3fcbc'

// intial setup
beforeAll(async (done) => {
  const setOtp = await post('/api/login/otp', opts)
  expect(setOtp.status).toBe(200) // stored
  const res = await post('/api/login/verify', verifyOpts)
  expect(res.status).toBe(200)

  // Get id
  const idRes = await getWithCookie(
    '/api/login/isLoggedIn',
    res.headers['set-cookie'],
  )

  // plant the url - success if shorturl does not exist, error if it exist
  const payload = {
    userId: idRes.data.user.id,
    shortUrl,
    longUrl: 'https://github.com/opengovsg/GoGovSG',
  }
  await postWithCookie('/api/user/url', res.headers['set-cookie'], payload)
  done()
})

describe('GET: /api/link-stats', () => {
  it('positive test: Should pass and expect link-stats results', async (done) => {
    const setOtp = await post('/api/login/otp', opts)
    expect(setOtp.status).toBe(200) // stored
    const res = await post('/api/login/verify', verifyOpts)
    expect(res.status).toBe(200)
    expect(res.data.message).toBe('OTP hash verification ok.')

    const queryString = `/api/link-stats?url=${shortUrl}`

    const linkStatsResponse = await getWithCookie(
      queryString,
      res.headers['set-cookie'],
    )

    // output can be null (never visited before) or object, but still pass
    expect(linkStatsResponse.status).toBe(200)
    done()
  })
})
