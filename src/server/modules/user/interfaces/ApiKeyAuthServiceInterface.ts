interface ApiKeyAuthServiceInterface {
  upsertApiKey: (userId: number) => Promise<string>
  hasApiKey: (userId: number) => Promise<boolean>
}

export default ApiKeyAuthServiceInterface
