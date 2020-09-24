import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import { MailerMock } from '../mocks/services/email'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { OtpRepositoryMock } from '../mocks/repositories/OtpRepository'
import { OtpRepositoryInterface } from '../../../src/server/repositories/interfaces/OtpRepositoryInterface'
import { Cryptography } from '../../../src/server/services/cryptography'
import CryptographyMock from '../mocks/services/cryptography'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import {
  clicksModelMock,
  devicesModelMock,
  getOtpCache,
  heatMapModelMock,
  mockDefine,
  mockQuery,
  mockTransaction,
  redisMockClient,
  urlModelMock,
  userModelMock,
} from './util'

// Mocked up bindings
container
  .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
  .to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)

// Fill in the rest of the bindings
import bindInversifyDependencies from '../../../src/server/inversify.config'

bindInversifyDependencies()

const app = express()
app.use(bodyParser.json())
app.use(function (_, res, next) {
  res.ok = function (msg) {
    this.status(200).send(msg)
  }
  res.serverError = function (msg) {
    this.status(500).send(msg)
  }
  next()
})
app.use(
  session({
    secret: 'notsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
)

// // Routes
import api from '../../../src/server/api'

const request = require('supertest')

app.use('/api', api)

// Redis Mocks
jest.mock('../../../src/server/redis', () => ({
  otpClient: redisMockClient,
}))

// Sequelize Mocks
jest.mock('../../../src/server/util/sequelize', () => ({
  transaction: mockTransaction,
  sequelize: {
    query: mockQuery,
    transaction: mockTransaction,
    define: mockDefine,
  },
}))

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

jest.mock('../../../src/server/services/email', () => ({
  MailerNode: MailerMock,
}))

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

describe('GET: /api/login/email/domains', () => {
  test('positive test: Should return *.test.sg ', function (done) {
    request(app)
      .get('/api/login/emaildomains')
      .expect('*.test.sg')
      .expect(200)
      .end(done)
  })
})

describe('GET: /api/login/message', () => {
  test('positive test: Should get back a message banner', function (done) {
    request(app)
      .get('/api/login/message')
      .expect(200)
      .expect('login message')
      .end(done)
  })
})

describe('POST: /api/login/otp', () => {
  test('positive test: Should notify the generation of an OTP', async (done) => {
    const res = await request(app)
      .post('/api/login/otp')
      .send({ email: 'otpgo.gov@open.test.sg' })
    expect(res.status).toBe(200)
    expect(res.ok).toBe(true)
    expect(res.body.message).toBe('OTP generated and sent.')
    done()
  })
})

describe('POST: /api/login/verify', () => {
  test('positive test: Should verify the OTP', async (done) => {
    // Prime cache
    getOtpCache().setOtpForEmail('otpgo.gov@open.test.sg', {
      hashedOtp: '1',
      retries: 100,
    })
    const res = await request(app)
      .post('/api/login/verify')
      .send({ email: 'otpgo.gov@open.test.sg', otp: '1' })
    console.log(res.headers['set-cookie'])
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('OTP hash verification ok.')
    done()
  })
})

// describe('POST: /api/login/isLoggedIn', () => {

//     test('positive test: Should verify is loggedin', async done =>{

//         // prime the cache
//         getOtpCache().setOtpForEmail('otpgo.gov@open.test.sg', {
//             hashedOtp: '1',
//             retries: 100
//         })

//         // Just to get cookie session
//         const cookieRes = await request(app)
//                                     .post('/api/login/verify')
//                                     .send({ email: "otpgo.gov@open.test.sg", otp: "1"})
//         console.log(cookieRes.headers['set-cookie'])
//         expect(cookieRes.status).toBe(200)
//         expect(cookieRes.body.message).toBe('OTP hash verification ok.')

//         const res = await request(app)
//                             .get('/api/login/isLoggedIn')
//                             .set('set-cookie', cookieRes.headers['set-cookie'])
//         // console.log(res)
//         expect(res.status).toBe(200)
//         done()
//     })
// })
