import { userModelMock } from '../api/util'
import { UserRepository } from '../../../src/server/repositories/UserRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { UserMapper } from '../../../src/server/mappers/UserMapper'

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

const userRepo = new UserRepository(
  new UserMapper(new UrlMapper()),
  new UrlMapper(),
)

/**
 * Simple integration test for UserRepository.
 */
describe('user repository implementation tests', () => {
  test('findOrCreate test', async () => {
    await expect(
      userRepo.findOrCreateWithEmail('aaa@open.test.sg'),
    ).resolves.toBe('aaa@open.test.sg')
  })
})
