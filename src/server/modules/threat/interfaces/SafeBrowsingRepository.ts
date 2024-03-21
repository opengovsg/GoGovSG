import { WebRiskThreat } from '../../../repositories/types'

export interface SafeBrowsingRepository {
  /**
   * Sets or replaces the Safe Browsing threat matches associated with a URL.
   * @param  {string} url The URL.
   * @param  {WebRiskThreat} threat The threat match returned by Safe Browsing for the URL.
   */
  set(url: string, threat: WebRiskThreat): Promise<void>

  /**
   * Retrieves Safe Browsing threat matches for a URL, if any.
   * @param  {string} url The URL.
   * @returns {Promise<WebRiskThreat | null>} Threat match or null if none.
   */
  get(url: string): Promise<WebRiskThreat | null>
}
