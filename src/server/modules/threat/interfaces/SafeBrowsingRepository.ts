import { HasCacheDuration } from '../../../repositories/types'

export interface SafeBrowsingRepository {
  /**
   * Sets or replaces the Safe Browsing threat matches associated with a URL.
   * @param  {string} url The URL.
   * @param  {Array<HasCacheDuration>} matches The threat matches returned by Safe Browsing for the URL.
   */
  set(url: string, matches: HasCacheDuration[]): Promise<void>

  /**
   * Retrieves Safe Browsing threat matches for a URL, if any.
   * @param  {string} url The URL.
   * @returns {Promise<Array<HasCacheDuration> | null>} An array of threat matches, or null if none.
   */
  get(url: string): Promise<HasCacheDuration[] | null>
}
