export interface UrlThreatScanService {
  isThreat(url: string): Promise<boolean>
}
