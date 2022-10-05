interface ApiKeyManagementServiceInterface {
  createApiKey: (userId: number) => Promise<string>
  getApiKeyHash: (apiKey: string) => Promise<string>
}

export default ApiKeyManagementServiceInterface
