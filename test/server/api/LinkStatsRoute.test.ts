import request from 'supertest'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { OtpRepositoryMock } from '../mocks/repositories/OtpRepository'
import { OtpRepositoryInterface } from '../../../src/server/repositories/interfaces/OtpRepositoryInterface'
import { Cryptography } from '../../../src/server/services/cryptography'
import CryptographyMock from '../mocks/services/cryptography'
import { UserRepositoryInterface } from '../../../src/server/repositories/interfaces/UserRepositoryInterface'
import { MockUserRepository } from '../mocks/repositories/UserRepository'
import { LinkStatisticsServiceMock } from '../mocks/services/LinkStatisticsService'
import { LinkStatisticsServiceInterface } from '../../../src/server/services/interfaces/LinkStatisticsServiceInterface'

// Binds mockups before binding default
container
  .bind<OtpRepositoryInterface>(DependencyIds.otpRepository)
  .to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)
container
  .bind<LinkStatisticsServiceInterface>(DependencyIds.linkStatisticsService)
  .to(LinkStatisticsServiceMock)

// Importing setup app
import app from './setup'

describe('GET /api/link-stats', () => {
  test('get statistics of mocked link', async (done) => {
    const shortUrl = 'random'
    const query = `/api/link-stats?url=${shortUrl}`

    const res = await request(app).get(query).set('prime', '1')
    expect(res.status).toBe(200)
    // From LinkStatisticsServiceMock
    expect(res.body).toStrictEqual({
      dailyClicks: [],
      deviceClicks: {
        desktop: 1,
        mobile: 3,
        others: 4,
        tablet: 2,
      },
      totalClicks: 1,
      weekdayClicks: [],
    })
    done()
  })
})
