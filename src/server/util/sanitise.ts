import { emailValidator } from '../config'

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

export default { sanitiseQuery }
