import { UAParser } from 'ua-parser-js'
import { CrawlerCheckServiceInterface } from './interfaces/CrawlerCheckServiceInterface'
import { injectable } from 'inversify'

@injectable()
export class CrawlerCheckService implements CrawlerCheckServiceInterface {
  public isCrawler: (userAgent: string) => boolean = (userAgent) => {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()
    if (result.browser.name && result.engine.name && result.os.name) {
      return false
    }
    return true
  }
}

export default CrawlerCheckService
