import ApiKeyAuthService from '../ApiKeyAuthService'

const userRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findOneUrlForUser: jest.fn(),
  findUserByUrl: jest.fn(),
  findUrlsForUser: jest.fn(),
  findOrCreateWithEmail: jest.fn(),
  saveApiKeyHash: jest.fn(),
  findUserByApiKey: jest.fn(),
}
const apiKeyHashString = '$2b$10$9rBKuE4Gb5ravnvP4xjoPu'
const baseUserId = 1
describe('ApiKeyAuthService', () => {
  beforeEach(() => {
    userRepository.saveApiKeyHash.mockReset()
  })
  it('createApiKey should call userRepository.saveApiKeyHash', async () => {
    const apiAuthService = new ApiKeyAuthService(
      userRepository,
      apiKeyHashString,
    )
    await apiAuthService.createApiKey(baseUserId)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledTimes(1)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledWith(
      baseUserId,
      expect.any(String),
    )
  })
  it('getUserByApiKey should call userRepository.getUserByApiKey', async () => {
    const apiAuthService = new ApiKeyAuthService(
      userRepository,
      apiKeyHashString,
    )
    const apiKey = 'test_v1_apiKey'
    await apiAuthService.getUserByApiKey(apiKey)
    expect(userRepository.findUserByApiKey).toHaveBeenCalledTimes(1)
    expect(userRepository.findUserByApiKey).toHaveBeenCalledWith(
      expect.any(String),
    )
  })
})
