import { inject, injectable } from 'inversify'
import bcrypt from 'bcrypt'
import _crypto from 'crypto'
import ApiKeyManagementServiceInterface from '../interfaces/ApiKeyManagementServiceInterface'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { DependencyIds } from '../../../constants'

const BASE64_ENCODING = 'base64'
// TODO: move these to env vars
const API_KEY_SALT = '$2b$10$VWCoSLIDq/gA9WZh7jZBiu'
const API_KEY_VERSION = '1'
const API_ENV = 'test'
@injectable()
class ApiKeyManagementService implements ApiKeyManagementServiceInterface {
  private userRepository: UserRepositoryInterface

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
  ) {
    this.userRepository = userRepository
  }

  createApiKey: (userId: number) => Promise<string> = async (
    userId: number,
  ) => {
    const apiKey = ApiKeyManagementService.generateApiKey()
    const apiKeyHash = await this.getApiKeyHash(apiKey)
    await this.userRepository.saveApiKeyHash(userId, apiKeyHash)
    return apiKeyHash
  }

  getApiKeyHash: (apiKey: string) => Promise<string> = async (
    apiKey: string,
  ) => {
    const [name, version, key] = apiKey.split('_')
    const hash = await bcrypt.hash(key, API_KEY_SALT)
    return `${name}_${version}_${hash.replace(API_KEY_SALT, '')}`
  }

  private static generateApiKey(): string {
    const randomString = _crypto.randomBytes(32).toString(BASE64_ENCODING)
    return `${API_ENV}_${API_KEY_VERSION}_${randomString}`
  }
}

export default ApiKeyManagementService