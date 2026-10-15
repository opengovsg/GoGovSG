import fetch from 'cross-fetch'
import { inject, injectable } from 'inversify'
import _ from 'lodash'
import { UrlThreatScanService } from '../interfaces/index.js'
import {
  logger,
  safeBrowsingKey,
  safeBrowsingLogOnly,
} from '../../../config.js'
import { SafeBrowsingRepository } from '../interfaces/SafeBrowsingRepository.js'
import { DependencyIds } from '../../../constants.js'
import { WebRiskThreat } from '../../../repositories/types.js'

// The key goes in a header: a URL carrying it leaks into fetch error messages
// and trace span names.
const ENDPOINT = 'https://webrisk.googleapis.com/v1/uris:search'
const API_KEY_HEADER = 'X-Goog-Api-Key'
// Successful calls have a p99 of 3-4.5s, while stalled ones hang for 20s+
// before Google returns a 502.
const WEB_RISK_TIMEOUT_MS = 5000
const HTTP_SERVER_ERROR_MIN = 500
// Bulk uploads hold up to bulkUploadMaxNum links; scanning them all at once
// slows every call.
const BULK_SCAN_CONCURRENCY = 10
const WEB_RISK_THREAT_TYPES = [
  'SOCIAL_ENGINEERING',
  'MALWARE',
  'UNWANTED_SOFTWARE',
  // SOCIAL_ENGINEERING_EXTENDED_COVERAGE improves coverage of malicious urls
  // but may have small amount (<10%) of potential false positives,
  // see details https://cloud.google.com/web-risk/docs/extended-coverage
  'SOCIAL_ENGINEERING_EXTENDED_COVERAGE',
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

    return `${ENDPOINT}?${threatTypesQuery}&uri=${encodedUrl}`
  }

  private requestWebRisk: (endpoint: string) => Promise<Response> = (
    endpoint,
  ) =>
    fetch(endpoint, {
      method: 'GET',
      headers: { [API_KEY_HEADER]: safeBrowsingKey as string },
      signal: AbortSignal.timeout(WEB_RISK_TIMEOUT_MS),
    })

  // Web Risk stalls, connection resets and gateway errors are usually
  // transient, so retry once.
  private requestWebRiskWithRetry: (endpoint: string) => Promise<Response> =
    async (endpoint) => {
      try {
        const response = await this.requestWebRisk(endpoint)
        const isServerError = response.status >= HTTP_SERVER_ERROR_MIN
        if (!isServerError) {
          return response
        }

        logger.warn(`Web Risk returned ${response.status}, retrying`)
      } catch (error) {
        logger.warn(`Web Risk request failed, retrying: ${error}`)
      }

      return this.requestWebRisk(endpoint)
    }

  private fetchWebRiskData: (url: string) => Promise<WebRiskThreat | null> =
    async (url) => {
      const endpoint = this.constructWebRiskEndpoint(url, WEB_RISK_THREAT_TYPES)

      const response = await this.requestWebRiskWithRetry(endpoint)
      // Gateway-level failures (e.g. a 502 from Google's front end) may return a
      // non-JSON or errorless body. Only those non-OK responses may fall back;
      // an HTTP 200 with unreadable JSON is still a scan failure, so it is not
      // cached as a clean verdict.
      const body = response.ok
        ? await response.json()
        : await response.json().catch(() => null)
      if (!response.ok) {
        const error = new Error(
          `Safe Browsing failure:\tError: ${response.statusText}\t message: ${
            body?.error?.message ?? 'unknown error'
          }`,
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

    // Each batch waits for its slowest scan; a worker pool would avoid that if
    // bulk upload latency becomes a problem.
    const results = await _.chunk(urls, BULK_SCAN_CONCURRENCY).reduce(
      async (previous, batch) => {
        const scanned = await previous
        const batchResults = await Promise.all(
          batch.map((url) => this.fetchWebRiskData(url)),
        )
        return [...scanned, ...batchResults]
      },
      Promise.resolve([] as (WebRiskThreat | null)[]),
    )

    const isThreat = results.some((result) => Boolean(result))
    if (!safeBrowsingLogOnly && isThreat) {
      return true
    }

    return false
  }
}

export default SafeBrowsingService
