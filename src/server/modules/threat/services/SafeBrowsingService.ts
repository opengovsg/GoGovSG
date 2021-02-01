import fetch from 'cross-fetch'
import { inject, injectable } from 'inversify'
import { logger, safeBrowsingKey, safeBrowsingLogOnly } from '../../../config'
import { SafeBrowsingRepository } from '../repositories'
import { DependencyIds } from '../../../constants'

const ENDPOINT = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingKey}`

@injectable()
export class SafeBrowsingService {
  private safeBrowsingRepository: SafeBrowsingRepository

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
      matches = await this.lookup(url)
    }
    return !safeBrowsingLogOnly && Boolean(matches)
  }

  private async lookup(url: string) {
    let matches = null
    const request = { ...this.requestTemplate } as any
    request.threatInfo.threatEntries = [{ url }]
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
        await this.safeBrowsingRepository.set(url, result.matches)
        const prefix = safeBrowsingLogOnly
          ? 'Considered threat by Safe Browsing but ignoring'
          : 'Malicious link content'
        logger.warn(
          `${prefix}: ${url} yields ${JSON.stringify(result.matches, null, 2)}`,
        )
        matches = result.matches
      }
    }
    return matches
  }
}

export default SafeBrowsingService
