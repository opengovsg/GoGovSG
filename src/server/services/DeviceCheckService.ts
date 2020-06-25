import { UAParser } from 'ua-parser-js'
import { injectable } from 'inversify'

import {
  DeviceCheckServiceInterface,
  DeviceType,
} from './interfaces/DeviceCheckServiceInterface'

@injectable()
export class DeviceCheckService implements DeviceCheckServiceInterface {
  getDeviceType: (userAgent: string) => DeviceType = (userAgent) => {
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
}

export default DeviceCheckService
