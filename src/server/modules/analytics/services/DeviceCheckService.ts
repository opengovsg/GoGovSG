import UAParser from 'ua-parser-js'
import { injectable } from 'inversify'

import * as interfaces from '../interfaces'
import { DeviceType } from '../interfaces'

const BOTS_USER_AGENTS =
  /bot|facebookexternalhit|Facebot|Slackbot|TelegramBot|WhatsApp|Twitterbot|Pinterest|Postman|url/

@injectable()
export class DeviceCheckService implements interfaces.DeviceCheckService {
  getDeviceType: (userAgent: string) => DeviceType = (userAgent) => {
    const parser = new UAParser(userAgent)
    const deviceType = parser.getDevice().type

    // Desktop browsers and bots do not get categorized by ua-parser.
    if (!deviceType) {
      const engine = parser.getEngine()
      if (engine.name && engine.version && !userAgent.match(BOTS_USER_AGENTS)) {
        return 'desktop'
      }
      return 'others'
    }

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
