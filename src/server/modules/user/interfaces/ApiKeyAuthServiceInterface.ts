interface ApiKeyAuthServiceInterface {
  createApiKey: (userId: number) => Promise<string>
}

export default ApiKeyAuthServiceInterface
