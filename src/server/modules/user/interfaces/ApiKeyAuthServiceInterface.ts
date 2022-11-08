interface ApiKeyAuthServiceInterface {
  upsertApiKey: (userId: number) => Promise<string>
  hasApiKey: (userId: any) => Promise<boolean>
}

export default ApiKeyAuthServiceInterface
