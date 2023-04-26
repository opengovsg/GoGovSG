import { inject, injectable } from 'inversify'
import bcrypt from 'bcrypt'
import _crypto from 'crypto'
import ApiKeyAuthServiceInterface from '../interfaces/ApiKeyAuthServiceInterface'
import dogstatsd, {
  API_KEY_GENERATE,
  API_KEY_GENERATE_TAG_IS_NEW,
} from '../../../util/dogstatsd'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { API_KEY_SEPARATOR, DependencyIds } from '../../../constants'
import { StorableUser } from '../../../repositories/types'
import { apiAdmin, apiEnv, apiKeySalt, apiKeyVersion } from '../../../config'

const BASE64_ENCODING = 'base64'
@injectable()
class ApiKeyAuthService implements ApiKeyAuthServiceInterface {
  private userRepository: UserRepositoryInterface

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
  ) {
    this.userRepository = userRepository
  }

  upsertApiKey: (userId: number) => Promise<string> = async (
    userId: number,
  ) => {
    const apiKey = ApiKeyAuthService.generateApiKey()
    const apiKeyHash = await ApiKeyAuthService.getApiKeyHash(apiKey)
    const isNewApiKey = !(await this.userRepository.hasApiKey(userId))
    await this.userRepository.saveApiKeyHash(userId, apiKeyHash)
    dogstatsd.increment(API_KEY_GENERATE, 1, 1, [
      `${API_KEY_GENERATE_TAG_IS_NEW}:${isNewApiKey}`,
    ])
    return apiKey
  }

  getUserByApiKey: (apiKey: string) => Promise<StorableUser | null> = async (
    apiKey: string,
  ) => {
    const apiKeyHash = await ApiKeyAuthService.getApiKeyHash(apiKey)
    return this.userRepository.findUserByApiKey(apiKeyHash)
  }

  isAdmin: (userId: number) => Promise<boolean> = async (userId: number) => {
    const user = await this.userRepository.findById(userId)
    if (!user) return false
    return apiAdmin.split(',').includes(user.email)
  }

  hasApiKey: (userId: number) => Promise<boolean> = async (userId: number) => {
    return this.userRepository.hasApiKey(userId)
  }

  static async getApiKeyHash(apiKey: string): Promise<string> {
    const [name, version, key] = apiKey.split(API_KEY_SEPARATOR)
    const hash = await bcrypt.hash(key, apiKeySalt)
    return `${name}_${version}_${hash.replace(apiKeySalt, '')}`
  }

  private static generateApiKey(): string {
    const randomString = _crypto.randomBytes(32).toString(BASE64_ENCODING)
    return `${apiEnv}_${apiKeyVersion}_${randomString}`
  }
}

export default ApiKeyAuthService
