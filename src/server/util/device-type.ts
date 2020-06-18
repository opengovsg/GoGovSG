import { UAParser } from 'ua-parser-js'

/**
 * Infers the type of device from a user agent string.
 *
 * @param userAgent The user agent string to infer device type from.
 */
export function getDeviceType(userAgent: string) {
  const parser = new UAParser(userAgent)
  const deviceType = parser.getDevice().type

  // Desktop browsers do not identify themselves in user agent.
  if (!deviceType) return 'desktop'

  // Possible types:
  // console, mobile, tablet, smarttv, wearable, embedded.
  switch (deviceType) {
    case 'tablet':
    case 'mobile':
      return deviceType
    default:
      return 'others'
  }
}

export default { getDeviceType }
