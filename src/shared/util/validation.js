const validator = require('validator')

const URL_OPTS = {
  protocols: ['https'],
  require_tld: true,
  require_protocol: true,
  require_host: true,
  require_valid_protocol: true,
  allow_underscores: false,
  host_whitelist: false,
  host_blacklist: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  disallow_auth: false,
}

/**
 * Tests if a URL string begins with https://.
 * @param {String} url
 * @return {Boolean}
 */
function isHttps(url) {
  return /^https:\/\//.test(url)
}

/**
 * Check if a URL string is valid.
 * @param {String} url
 * @return {Boolean}
 */
function isValidUrl(url) {
  return validator.isURL(url, URL_OPTS)
}

/**
 * Tests if a short link consists of alphanumeric and hyphen characters.
 * @param {String} url
 * @param {Boolean} allowBlank
 * @return {Boolean}
 */
function isValidShortUrl(url, allowBlank = false) {
  return allowBlank
    ? /^[a-z0-9-]*$/.test(url)
    : /^[a-z0-9-]+$/.test(url)
}

/**
 * Tests the validity of a long url. Will return true if blank.
 * @param {String} url
 * @return {Boolean}
 */
function isValidLongUrl(url, allowBlank = false) {
  return (allowBlank && !url) || isValidUrl(`https://${url}`)
}

module.exports = {
  isHttps,
  isValidLongUrl,
  isValidShortUrl,
  isValidUrl,
}
