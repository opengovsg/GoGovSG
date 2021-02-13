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
import { LinkStatisticsService } from '../../../src/server/modules/analytics/interfaces'

const linkStatistics = {
  totalClicks: 1,
  deviceClicks: {
    desktop: 1,
    tablet: 2,
    mobile: 3,
    others: 4,
  },
  dailyClicks: [],
  weekdayClicks: [],
}

const getLinkStatistics = jest.fn()
const updateLinkStatistics = jest.fn()
getLinkStatistics.mockResolvedValue(linkStatistics)
// Binds mockups before binding default
container.bind<OtpRepository>(DependencyIds.otpRepository).to(OtpRepositoryMock)
container.bind<Cryptography>(DependencyIds.cryptography).to(CryptographyMock)
container
  .bind<UserRepositoryInterface>(DependencyIds.userRepository)
  .to(MockUserRepository)
container
  .bind<LinkStatisticsService>(DependencyIds.linkStatisticsService)
  .toConstantValue({ getLinkStatistics, updateLinkStatistics })

// Importing setup app
import app from './setup'

describe('GET /api/link-stats', () => {
  test('get statistics of mocked link', async () => {
    const shortUrl = 'random'
    const query = `/api/link-stats?url=${shortUrl}`

    const res = await request(app).get(query).set('prime', '1')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual(linkStatistics)
  })
})
