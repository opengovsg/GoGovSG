/**
 * Extracts the hostname from an input url.
 * @param urlToParse The url for its hostname to be extracted.
 */
export default function parseDomain(urlToParse: string): string {
  // Fallbacks to input url if it is not a valid url.
  let parsedUrl = urlToParse
  try {
    const url = new URL(urlToParse)
    parsedUrl = url.hostname
  } finally {
    return parsedUrl
  }
}
