export interface CrawlerCheckServiceInterface {
  isCrawler(userAgent: string): boolean
}
