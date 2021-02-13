import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { OtpRepositoryMock } from '../mocks/repositories/OtpRepository'
import {
  Cryptography,
  OtpRepository,
} from '../../../src/server/modules/auth/interfaces'
import CryptographyMock from '../mocks/services/cryptography'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import { getOtpCache } from './util'

// Binds mockups before binding default
container.bind<OtpRepository>(DependencyIds.otpRepository).to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)

// Importing setup app
import app from './setup'

describe('GET /api/login/email/domains', () => {
  test('return an email domain', async (done) => {
    const res = await request(app).get('/api/login/emaildomains')

    expect(res.text).toBe('*.test.sg')
    expect(res.status).toBe(200)
    done()
  })
})

describe('GET /api/login/message', () => {
  test('get back message banner', async (done) => {
    const res = await request(app).get('/api/login/message')

    expect(res.text).toBe('login message')
    expect(res.status).toBe(200)
    done()
  })
})

describe('POST /api/login/otp', () => {
  test('notify the generation of an OTP', async (done) => {
    const res = await request(app)
      .post('/api/login/otp')
      .send({ email: 'otpgo.gov@open.test.sg' })
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(res.body.message).toBe('OTP generated and sent.')
    done()
  })
})

describe('POST /api/login/verify', () => {
  test('verify the OTP', async (done) => {
    // Prime cache
    getOtpCache().setOtpForEmail('otpgo.gov@open.test.sg', {
      hashedOtp: '1',
      retries: 100,
    })
    const res = await request(app)
      .post('/api/login/verify')
      .send({ email: 'otpgo.gov@open.test.sg', otp: '1' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('OTP hash verification ok.')
    done()
  })
})

describe('GET /api/login/isLoggedIn', () => {
  test('verify is loggedin', async (done) => {
    const res = await request(app)
      .get('/api/login/isLoggedIn')
      .set('prime', '1')
    expect(res.status).toBe(200)
    done()
  })
})
