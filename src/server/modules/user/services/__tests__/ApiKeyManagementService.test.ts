import ApiKeyAuthService from '../ApiKeyAuthService'

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
describe('ApiKeyAuthService', () => {
  beforeEach(() => {
    userRepository.saveApiKeyHash.mockReset()
  })
  it('should call userRepository.createApiKey', async () => {
    const apiManagementService = new ApiKeyAuthService(userRepository)
    await apiManagementService.createApiKey(baseUserId)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledTimes(1)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledWith(
      baseUserId,
      expect.any(String),
    )
  })
})
