import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import StubOperatorCopyService from '../../../src/server/services/StubOperatorCopyService'
import {
  ANNOUNCEMENT_GOV,
  LOGIN_MESSAGE_GOV,
  USER_MESSAGE_GOV,
} from '../../../src/server/lib/growthbook'

// Binds mockups before binding default
import { OtpRepositoryMock } from '../mocks/repositories/OtpRepository'
import {
  Cryptography,
  OtpRepository,
} from '../../../src/server/modules/auth/interfaces'
import CryptographyMock from '../mocks/services/cryptography'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { MockUserRepository } from '../mocks/repositories/UserRepository'

container.bind<OtpRepository>(DependencyIds.otpRepository).to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)

const stubOperatorCopyService = new StubOperatorCopyService(
  'gov login snackbar',
  'gov dashboard banner',
  {
    title: 'Campaign title',
    subtitle: 'Campaign subtitle',
    message: 'Campaign body',
    url: 'https://go.gov.sg/campaign',
    image: '/assets/gov/announcement.svg',
    buttonText: 'Learn more',
  },
)

container
  .bind(DependencyIds.operatorCopyService)
  .toConstantValue(stubOperatorCopyService)

// Importing setup app
import app from './setup'

describe('GET /api/login/message', () => {
  test('returns login snackbar for unauthenticated visitors', async () => {
    const res = await request(app).get('/api/login/message')

    expect(res.status).toBe(200)
    expect(res.text).toBe('gov login snackbar')
  })
})

describe('GET /api/user/message', () => {
  test('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/user/message')

    expect(res.status).toBe(401)
  })

  test('returns dashboard banner when authenticated', async () => {
    const res = await request(app)
      .get('/api/user/message')
      .set('prime', '1')

    expect(res.status).toBe(200)
    expect(res.text).toBe('gov dashboard banner')
  })
})

describe('GET /api/user/announcement', () => {
  test('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/user/announcement')

    expect(res.status).toBe(401)
  })

  test('returns announcement JSON when authenticated', async () => {
    const res = await request(app)
      .get('/api/user/announcement')
      .set('prime', '1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      title: 'Campaign title',
      subtitle: 'Campaign subtitle',
      message: 'Campaign body',
      url: 'https://go.gov.sg/campaign',
      image: '/assets/gov/announcement.svg',
      buttonText: 'Learn more',
    })
  })
})

// Document the GrowthBook key registry used by the server implementation.
describe('GrowthBook feature keys', () => {
  test('uses the gov variant keys for this test environment', () => {
    expect(LOGIN_MESSAGE_GOV).toBe('login_message_gov')
    expect(USER_MESSAGE_GOV).toBe('user_message_gov')
    expect(ANNOUNCEMENT_GOV).toBe('announcement_gov')
  })
})
