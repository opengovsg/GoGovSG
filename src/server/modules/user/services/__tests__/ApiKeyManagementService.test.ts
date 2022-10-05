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
describe('ApiKeyManagementService', () => {
  beforeEach(() => {
    userRepository.saveApiKeyHash.mockReset()
  })
  it('should call userRepository.createApiKey', async () => {
    const apiManagementService = new ApiKeyManagementService(userRepository)
    await apiManagementService.createApiKey(baseUserId)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledTimes(1)
    expect(userRepository.saveApiKeyHash).toHaveBeenCalledWith(
      baseUserId,
      expect.any(String),
    )
  })
})
