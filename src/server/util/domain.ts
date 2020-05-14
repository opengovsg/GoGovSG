/**
 * Extracts the hostname from an input url.
 * @param urlToParse The url for its hostname to be extracted.
 */
export default function parseDomain(urlToParse: string): string {
  let parsedUrl
  try {
    const url = new URL(urlToParse)
    parsedUrl = url.hostname
  } catch {
    // Fallbacks to input url if it is not a valid url.
    parsedUrl = urlToParse
  }
  return parsedUrl
}
