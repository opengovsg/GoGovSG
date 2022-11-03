import { injectable } from 'inversify'
import ApiKeyManagementServiceInterface from '../interfaces/ApiKeyManagementServiceInterface'

@injectable()
class ApiKeyManagementService implements ApiKeyManagementServiceInterface {
  createApiKey: () => Promise<string> = () => {
    return Promise.resolve('')
  }
}

export default ApiKeyManagementService
