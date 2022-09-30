import { inject, injectable } from 'inversify'
import bcrypt from 'bcrypt'
import ApiKeyManagementServiceInterface from '../interfaces/ApiKeyManagementServiceInterface'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import { DependencyIds } from '../../../constants'

const API_KEY_SALT = 'keySalt'
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
    const apiKeyHash = await ApiKeyManagementService.getApiKeyHash(apiKey)
    await this.userRepository.saveApiKeyHash(userId, apiKeyHash)
    return Promise.resolve(apiKeyHash)
    // return await this.userRepository.saveApiKeyHash(userId, apiKeyHash)
  }

  private static getApiKeyHash: (apiKey: string) => Promise<string> = async (
    apiKey: string,
  ) => {
    const [name, version, key] = apiKey.split('_')
    const hash = await bcrypt.hash(key, API_KEY_SALT)
    return `${name}_${version}_${hash.replace(API_KEY_SALT, '')}`
  }

  private static generateApiKey(): string {
    return ''
  }
}

export default ApiKeyManagementService
