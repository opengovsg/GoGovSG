interface ApiKeyAuthServiceInterface {
  upsertApiKey: (userId: number) => Promise<string>
}

export default ApiKeyAuthServiceInterface
