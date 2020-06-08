import validator from 'validator'
import { parse } from 'url'

import { ogHostname } from '../../server/config'
import blacklist from '../../server/resources/blacklist'

export const WHITELIST = [new RegExp('^http://localhost:4572')]

export const URL_OPTS: ValidatorJS.IsURLOptions = {
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
  return allowBlank ? /^[a-z0-9-]*$/.test(url) : /^[a-z0-9-]+$/.test(url)
}

// Tests the validity of a long url. Will return true if blank.
export function isValidLongUrl(url: string, allowBlank = false): boolean {
  return (allowBlank && !url) || isValidUrl(`https://${url}`)
}

// Checks if go short url redirects to go domain.
export function isCircularRedirects(url: string): boolean {
  return parse(url).hostname === ogHostname
}
