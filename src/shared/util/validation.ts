import validator from 'validator'
import { parse } from 'url'

import blacklist from '../../server/resources/blacklist'

export const WHITELIST = [new RegExp('^http://localhost:4566')]

export const SHORT_URL_REGEX = /^[a-z0-9-]+$/

export const TAG_STRING_REGEX = /^[A-Za-z0-9-]+$/

export const MAX_TAG_LENGTH = 25

export const URL_OPTS: validator.IsURLOptions = {
  protocols: ['https'],
  require_tld: true,
  require_protocol: true,
  require_host: true,
  require_valid_protocol: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  disallow_auth: false,
}

// Checks if url is whitelisted.
export function isWhitelisted(url: string): boolean {
  return WHITELIST.some((regexp) => url.match(regexp))
}

// Checks if url is blacklisted.
export function isBlacklisted(url: string): boolean {
  return blacklist.some((bl) => url.includes(bl))
}

// Tests if a URL string begins with https://.
export function isHttps(url: string, useWhitelist = false): boolean {
  if (useWhitelist && isWhitelisted(url)) return true
  return /^https:\/\//.test(url)
}

// Check if a URL string is valid.
export function isValidUrl(url: string, useWhitelist = false): boolean {
  if (useWhitelist && isWhitelisted(url)) return true
  return validator.isURL(url, URL_OPTS)
}

// Tests if a short link consists of alphanumeric and hyphen characters.
export function isValidShortUrl(url: string, allowBlank = false): boolean {
  return allowBlank ? /^[a-z0-9-]*$/.test(url) : SHORT_URL_REGEX.test(url)
}

// Tests the validity of a long url. Will return true if blank.
export function isValidLongUrl(
  url: string,
  allowBlank = false,
  useWhitelist = false,
): boolean {
  return (allowBlank && !url) || isValidUrl(`https://${url}`, useWhitelist)
}

// Checks if go short url redirects to go domain.
export function isCircularRedirects(
  url: string,
  hostname?: string | null,
): boolean {
  return Boolean(hostname) && parse(url).hostname === hostname
}

export function isPrintableAscii(string: string): boolean {
  // Only accepts characters from 0x20 to 0x7F
  return /^[\x20-\x7F]*$/.test(string)
}

// Tests if a tag is valid.
export function isValidTag(tag: string, allowBlank = false): boolean {
  return (
    (allowBlank && tag === '') ||
    (TAG_STRING_REGEX.test(tag) && tag.length <= MAX_TAG_LENGTH)
  )
}
