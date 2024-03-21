import fetch from 'cross-fetch'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { UrlThreatScanService } from '../interfaces'
import { logger, safeBrowsingKey, safeBrowsingLogOnly } from '../../../config'
import { SafeBrowsingRepository } from '../interfaces/SafeBrowsingRepository'
import { DependencyIds } from '../../../constants'
import { WebRiskThreat } from '../../../repositories/types'

const ENDPOINT = `https://webrisk.googleapis.com/v1/uris:search?key=${safeBrowsingKey}`
const WEB_RISK_THREAT_TYPES = [
  'SOCIAL_ENGINEERING',
  'MALWARE',
  'UNWANTED_SOFTWARE',
]

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

  public isThreat: (url: string) => Promise<boolean> = async (url) => {
    if (!safeBrowsingKey) {
      logger.warn(`No Safe Browsing API key provided. Not scanning url: ${url}`)
      return false
    }
    let threat = await this.safeBrowsingRepository.get(url)
    if (!threat) {
      threat = await this.fetchWebRiskData(url)
    }
    return !safeBrowsingLogOnly && Boolean(threat)
  }

  private constructWebRiskEndpoint: (
    url: string,
    threatTypes: string[],
  ) => string = (url, threatTypes) => {
    const encodedUrl = encodeURIComponent(url)

    const threatTypesQuery = threatTypes
      .map((type: string) => `threatTypes=${type}`)
      .join('&')

    return `${ENDPOINT}&${threatTypesQuery}&uri=${encodedUrl}`
  }

  private fetchWebRiskData: (url: string) => Promise<WebRiskThreat | null> =
    async (url) => {
      const endpoint = this.constructWebRiskEndpoint(url, WEB_RISK_THREAT_TYPES)

      const response = await fetch(endpoint, { method: 'GET' })
      const body = await response.json()
      if (!response.ok) {
        const error = new Error(
          `Safe Browsing failure:\tError: ${response.statusText}\t message: ${body.error.message}`,
        )
        if (safeBrowsingLogOnly) {
          logger.error(error.message)
        } else {
          throw error
        }
      } else if (body?.threat) {
        const prefix = safeBrowsingLogOnly
          ? 'Considered threat by Safe Browsing but ignoring'
          : 'Malicious link content'

        /**
         * Result.threat.threatTypes is a list of threat matches for a url, example:
         * "threat": { "threatTypes": ["MALWARE"], "expireTime": "2024-03-20T05:29:41.898456500Z"}.
         */
        logger.warn(
          `${prefix}: ${url} yields ${JSON.stringify(body.threat, null, 2)}`,
        )
        try {
          // writing to the safeBrowsingRepository should be non-blocking
          this.safeBrowsingRepository.set(url, body.threat)
        } catch (e) {
          // writes are wrapped in a try-catch block to prevent errors from bubbling up
          logger.warn(
            `failed to set ${url} in safeBrowsingRepository, skipping`,
          )
        }
        return body.threat
      }
      return null
    }

  public isThreatBulk: (urls: string[]) => Promise<boolean> = async (urls) => {
    if (!safeBrowsingKey) {
      logger.warn(`No Safe Browsing API key provided. Not scanning in bulk`)
      return false
    }

    const results = await Promise.all(
      urls.map((url) => this.fetchWebRiskData(url)),
    )
    const isThreat = results.some((result) => Boolean(result))
    if (!safeBrowsingLogOnly && isThreat) {
      return true
    }

    return false
  }
}

export default SafeBrowsingService
