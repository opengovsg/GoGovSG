import { emailValidator, ogHostname } from '../config'

/**
 * Remove wildcard and escape characters from the query.
 * @param query The query to sanitise.
 */
export function sanitiseQuery(query: string) {
  // check legit domain
  if (emailValidator.match(query)) {
    // remove wildcards characters and escape characters
    const inputRaw = query.replace(/(%|\\)/g, '')
    return `%${inputRaw}`
  }

  return ''
}

/**
 * Checks for full short link URL in the query and extract out the short link.
 * @param query The query to check.
 */
export function extractShortUrl(query: string) {
  const regExp = new RegExp(`^https://${ogHostname}/(.*)`)
  const capture = regExp.exec(query)
  if (capture) {
    return capture[1]
  }
  return null
}
