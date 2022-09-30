export interface UrlThreatScanService {
  isThreat(url: string): Promise<boolean>
  isThreatBulk(urls: string[]): Promise<boolean>
}
