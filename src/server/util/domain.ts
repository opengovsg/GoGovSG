/**
 * Extracts the root domain from an input url.
 * @param url the url for its root domain to be extracted.
 * @returns the root domain is url is valid, else the unchanged url.
 */
export default function parseDomain(url: string): string {
  const regex: RegExp = /^((http|https):\/\/)([^/]*)/
  const parsedArray = regex.exec(url)
  if (parsedArray) {
    // [0]: Entire match,
    // [1]: ((http|https):\/\/) match,
    // [2]: (http|https) match,
    // [3]: ([^/]*) match, which should be the root domain.
    return parsedArray[3];
  }
  // Returns full url as fallback if cannot be parsed.
  return url
}
