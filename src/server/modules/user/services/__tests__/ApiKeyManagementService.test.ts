import ApiKeyManagementService from '../ApiKeyManagementService'

const userRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findOneUrlForUser: jest.fn(),
  findUserByUrl: jest.fn(),
  findUrlsForUser: jest.fn(),
  findOrCreateWithEmail: jest.fn(),
  saveApiKeyHash: jest.fn(),
}
const baseUserId = 1
const baseApiKey = 'ApiKey'
describe('ApiKeyManagementService', () => {
  beforeEach(() => {
    userRepository.saveApiKeyHash.mockReset()
  })
  it('should call userRepository.createApiKey', async () => {
    userRepository.saveApiKeyHash.mockResolvedValue(baseApiKey)
    const apiManagementService = new ApiKeyManagementService(userRepository)
    const apiKey = await apiManagementService.createApiKey(baseUserId)
    expect(apiKey).toBe(baseApiKey)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledTimes(1)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledWith(baseUserId)
  })
})
