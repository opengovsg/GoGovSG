import { get, getWithCookie, post } from './requests'

describe('GET: /api/login/emaildomains', () => {
  it('positive test: Should return the *.gov.sg', async (done) => {
    const res = await get('/api/login/emaildomains')
    expect(res.data).toBe('*.gov.sg')
    expect(res.status).toBe(200)
    done()
  })
})

describe('GET: /api/login/message', () => {
  it('positive test: Should get back message', async (done) => {
    const res = await get('/api/login/message')
    expect(res.data).toBe('Your OTP might take awhile to get to you.')
    expect(res.status).toBe(200)
    done()
  })
})

describe('POST: /api/login/otp', () => {
  it('positive test: Should notify the generation of an OTP', async (done) => {
    const body = {
      email: 'otpgo.gov@open.gov.sg',
    }

    const res = await post('/api/login/otp', body)
    expect(res.data.message).toBe('OTP generated and sent.')
    expect(res.status).toBe(200)
    done()
  })

  it('negative test with valid input: Should not pass with other domain name', async (done) => {
    const body = {
      email: 'otpgogo.gov@hotmail.com',
    }
    const res = await post('/api/login/otp', body)
    expect(res.response.status).toBe(401)
    expect(res.response.data).toBe(
      'Error validating request body. Invalid email provided. Email domain is not whitelisted..',
    )
    done()
  })

  it('negative test with invalid input: Should not pass with empty email', async (done) => {
    const body = {
      email: '',
    }
    const res = await post('/api/login/otp', body)
    expect(res.response.status).toBe(401)
    expect(res.response.data).toBe(
      'Error validating request body. "email" is not allowed to be empty.',
    )
    done()
  })
})

describe('POST: /api/login/verify', () => {
  it('positive test: Should pass after storing OTP and verifying it', async (done) => {
    const email = 'verifygo.gov@open.gov.sg'
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
    done()
  })

  it('negative test with valid input: Should fail as OTP is not stored', async (done) => {
    const email = 'verifygo.gov@open.gov.sg'
    const otp = '111111' // 111111 is the default

    const verifyOpts = {
      email,
      otp,
    }
    const res = await post('/api/login/verify', verifyOpts)
    expect(res.response.status).toBe(401)
    expect(res.response.data.message).toBe('OTP expired/not found.')
    done()
  })

  it('negative test with valid input: Should fail due to wrong OTP', async (done) => {
    const email = 'verifygo.gov@open.gov.sg'
    const otp = '222222' // 111111 is the default

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
    expect(res.response.status).toBe(401)
    expect(res.response.data.message).toBe(
      'OTP hash verification failed, 2 attempt(s) remaining.',
    )
    done()
  })
})

describe('GET: /api/login/isLoggedIn', () => {
  it('positive test: Should get back message after going through the process', async (done) => {
    const email = 'loggedgo.gov@open.gov.sg'
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
    const isLoggedInRes = await getWithCookie(
      '/api/login/isLoggedIn',
      res.headers['set-cookie'],
    )
    expect(isLoggedInRes.status).toBe(200)
    done()
  })
})
