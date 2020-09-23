import { getWithCookie, post } from './requests'

describe('GET: /api/logout', () => {
  it('positive test: Should end the session', async (done) => {
    const email = 'go.gov@open.gov.sg'
    const otp = '111111'

    const opts = {
      email,
    }

    const verifyOpts = {
      email,
      otp,
    }

    const setOtp = await post('/api/login/otp', opts)
    expect(setOtp.status).toBe(200) // stored
    const res = await post('/api/login/verify', verifyOpts)
    expect(res.status).toBe(200)
    expect(res.data.message).toBe('OTP hash verification ok.')
    const logoutResponse = await getWithCookie(
      '/api/logout',
      res.headers['set-cookie'],
    )
    expect(logoutResponse.status).toBe(200)
    done()
  })
})
