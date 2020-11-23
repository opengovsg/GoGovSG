import { UAParser } from 'ua-parser-js'
import { injectable } from 'inversify'

@injectable()
export class CrawlerCheckService {
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
