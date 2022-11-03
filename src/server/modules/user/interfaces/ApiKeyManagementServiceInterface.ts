interface ApiKeyManagementServiceInterface {
  createApiKey: () => Promise<string>
}

export default ApiKeyManagementServiceInterface
