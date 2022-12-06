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
  hasApiKey: jest.fn(),
}
const apiAuthService = new ApiKeyAuthService(userRepository)
jest.spyOn(ApiKeyAuthService, 'getApiKeyHash').mockResolvedValue('')
const baseUserId = 1

describe('ApiKeyAuthService', () => {
  beforeEach(() => {
    userRepository.saveApiKeyHash.mockReset()
    userRepository.findUserByApiKey.mockReset()
    userRepository.hasApiKey.mockReset()
  })
  it('createApiKey should call userRepository.saveApiKeyHash', async () => {
    await apiAuthService.upsertApiKey(baseUserId)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledTimes(1)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledWith(
      baseUserId,
      expect.any(String),
    )
  })
  it('getUserByApiKey should call userRepository.getUserByApiKey', async () => {
    const apiKey = 'test_v1_apiKey'
    await apiAuthService.getUserByApiKey(apiKey)
    expect(userRepository.findUserByApiKey).toHaveBeenCalledTimes(1)
    expect(userRepository.findUserByApiKey).toHaveBeenCalledWith(
      expect.any(String),
    )
  })
  it('hasApiKey should call userRepository.hasApiKey', async () => {
    await apiAuthService.hasApiKey(baseUserId)
    expect(userRepository.hasApiKey).toHaveBeenCalledTimes(1)
    expect(userRepository.hasApiKey).toHaveBeenCalledWith(baseUserId)
  })
  it('isAdmin should call userRepository.findById', async () => {
    await apiAuthService.isAdmin(baseUserId)
    expect(userRepository.findById).toHaveBeenCalledTimes(1)
    expect(userRepository.findById).toHaveBeenCalledWith(baseUserId)
  })
})
