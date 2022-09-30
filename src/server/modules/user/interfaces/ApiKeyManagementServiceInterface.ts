interface ApiKeyManagementServiceInterface {
  createApiKey: (userId: number) => Promise<string>
}

export default ApiKeyManagementServiceInterface
