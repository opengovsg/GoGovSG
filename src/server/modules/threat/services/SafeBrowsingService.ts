import fetch from 'cross-fetch'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { UrlThreatScanService } from '../interfaces'
import { logger, safeBrowsingKey, safeBrowsingLogOnly } from '../../../config'
import { SafeBrowsingRepository } from '../interfaces/SafeBrowsingRepository'
import { DependencyIds } from '../../../constants'

const ENDPOINT = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingKey}`
const SAFE_BROWSING_LIMIT = 500

@injectable()
export class SafeBrowsingService implements UrlThreatScanService {
  private safeBrowsingRepository: SafeBrowsingRepository

  public aFetch: any = fetch

  public constructor(
    @inject(DependencyIds.safeBrowsingRepository)
    safeBrowsingRepository: SafeBrowsingRepository,
  ) {
    this.safeBrowsingRepository = safeBrowsingRepository
  }

  /**
   * Request template for Safe Browsing. Threat lists found
   * at /v4/threatLists and are keyed by type, platform and entry.
   * Both ANY_PLATFORM and all the platforms are specified, the latter
   * so that we can look up the IP_RANGE lists, which are not keyed by
   * ANY_PLATFORM.
   */
  private requestTemplate = Object.freeze({
    client: {
      clientId: 'GoGovSG',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'POTENTIALLY_HARMFUL_APPLICATION',
        'UNWANTED_SOFTWARE',
        'MALWARE',
        'SOCIAL_ENGINEERING',
      ],
      platformTypes: ['ANY_PLATFORM', 'WINDOWS', 'LINUX', 'OSX'],
      threatEntryTypes: ['URL', 'EXECUTABLE', 'IP_RANGE'],
    },
  })

  public isThreat: (url: string) => Promise<boolean> = async (url) => {
    if (!safeBrowsingKey) {
      logger.warn(`No Safe Browsing API key provided. Not scanning url: ${url}`)
      return false
    }
    let matches = await this.safeBrowsingRepository.get(url)
    if (!matches) {
      matches = await this.lookup([url])
    }
    return !safeBrowsingLogOnly && Boolean(matches)
  }

  private async lookup(urls: string[]) {
    let matches = null
    const request = { ...this.requestTemplate } as any

    request.threatInfo.threatEntries = urls.map((url) => {
      return { url }
    })

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = new Error(
        `Safe Browsing failure:\tError: ${response.statusText}\thttpResponse: ${response}\t body:${response.body}`,
      )
      if (safeBrowsingLogOnly) {
        logger.error(error)
      } else {
        throw error
      }
    } else {
      const result = await response.json()
      if (result?.matches) {
        const prefix = safeBrowsingLogOnly
          ? 'Considered threat by Safe Browsing but ignoring'
          : 'Malicious link content'

        /**
         * Result.matches is a list of threat matches for all matched urls, example:
         * [{ "threatType": "SOCIAL_ENGINEERING", "threat": { "url": "https://testsafebrowsing.appspot.com/s/phishing.html" } }]
         * we use _.groupBy to group threat matches by url so that the serialized form
         * matches what is currently written into our repository for single url lookups.
         */
        const matchesByUrl = _.groupBy(result.matches, (obj) => obj.threat.url)
        Object.entries(matchesByUrl).forEach(
          ([url, threatMatch]: [string, any]) => {
            logger.warn(
              `${prefix}: ${url} yields ${JSON.stringify(
                threatMatch,
                null,
                2,
              )}`,
            )
            try {
              // writing to the safeBrowsingRepository should be non-blocking
              this.safeBrowsingRepository.set(url, threatMatch)
            } catch (e) {
              // writes are wrapped in a try-catch block to prevent errors from bubbling up
              logger.warn(
                `failed to set ${url} in safeBrowsingRepository, skipping`,
              )
            }
          },
        )
        matches = result.matches
      }
    }
    return matches
  }

  public isThreatBulk: (
    urls: string[],
    batchSize?: number,
  ) => Promise<boolean> = async (urls, batchSize = SAFE_BROWSING_LIMIT) => {
    if (!safeBrowsingKey) {
      logger.warn(`No Safe Browsing API key provided. Not scanning in bulk`)
      return false
    }

    const urlChunks: string[][] = []

    for (let i = 0; i < urls.length; i += batchSize) {
      urlChunks.push(urls.slice(i, i + batchSize))
    }

    const matches = await Promise.all(
      urlChunks.map((urlChunk) => this.lookup(urlChunk)),
    )
    const isThreat = matches.some((match) => Boolean(match) === true)
    if (!safeBrowsingLogOnly && isThreat) {
      return true
    }

    return false
  }
}

export default SafeBrowsingService
