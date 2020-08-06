export interface UrlThreatScanServiceInterface {
  isThreat(url: string): Promise<boolean>
}
