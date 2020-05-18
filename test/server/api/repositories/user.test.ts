import { userModelMock } from '../util'
import { UserRepositorySequelize } from '../../../../src/server/api/repositories/user'

jest.mock('../../../../src/server/models/user', () => ({
  User: userModelMock,
}))

const userRepo = new UserRepositorySequelize()

describe('user repository sequelize implementation tests', () => {
  test('findOrCreate test', async () => {
    await expect(
      userRepo.findOrCreateWithEmail('aaa@open.test.sg'),
    ).resolves.toBe('aaa@open.test.sg')
  })
})
