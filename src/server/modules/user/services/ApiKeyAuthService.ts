import { inject, injectable } from 'inversify'
import bcrypt from 'bcrypt'
import _crypto from 'crypto'
import ApiKeyAuthServiceInterface from '../interfaces/ApiKeyAuthServiceInterface'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { DependencyIds } from '../../../constants'
import { StorableUser } from '../../../repositories/types'
import { apiEnv, apiKeySalt, apiKeyVersion } from '../../../config'

const BASE64_ENCODING = 'base64'
@injectable()
class ApiKeyAuthService implements ApiKeyAuthServiceInterface {
  private userRepository: UserRepositoryInterface

  private readonly apiKeySalt: string

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    apiKeySaltString?: string,
  ) {
    this.userRepository = userRepository
    this.apiKeySalt = apiKeySaltString || apiKeySalt
  }

  createApiKey: (userId: number) => Promise<string> = async (
    userId: number,
  ) => {
    const apiKey = ApiKeyAuthService.generateApiKey()
    const apiKeyHash = await this.getApiKeyHash(apiKey)
    await this.userRepository.saveApiKeyHash(userId, apiKeyHash)
    return apiKey
  }

  getUserByApiKey: (apiKey: string) => Promise<StorableUser | null> = async (
    apiKey: string,
  ) => {
    const apiKeyHash = await this.getApiKeyHash(apiKey)
    return this.userRepository.findUserByApiKey(apiKeyHash)
  }

  private getApiKeyHash: (apiKey: string) => Promise<string> = async (
    apiKey: string,
  ) => {
    const [name, version, key] = apiKey.split('_')
    const hash = await bcrypt.hash(key, this.apiKeySalt)
    return `${name}_${version}_${hash.replace(this.apiKeySalt, '')}`
  }

  private static generateApiKey(): string {
    const randomString = _crypto.randomBytes(32).toString(BASE64_ENCODING)
    return `${apiEnv}_${apiKeyVersion}_${randomString}`
  }
}

export default ApiKeyAuthService
