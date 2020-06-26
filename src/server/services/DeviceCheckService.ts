import { UAParser } from 'ua-parser-js'
import { injectable } from 'inversify'

import {
  DeviceCheckServiceInterface,
  DeviceType,
} from './interfaces/DeviceCheckServiceInterface'

const BOTS_USER_AGENTS = /facebookexternalhit|Facebot|Slackbot|TelegramBot|WhatsApp|Twitterbot|Pinterest|Postman|url/

@injectable()
export class DeviceCheckService implements DeviceCheckServiceInterface {
  getDeviceType: (userAgent: string) => DeviceType = (userAgent) => {
    const parser = new UAParser(userAgent)
    const deviceType = parser.getDevice().type

    // Desktop browsers and bots do not get categorized by ua-parser.
    if (!deviceType) {
      return !userAgent.match(BOTS_USER_AGENTS) ? 'desktop' : 'others'
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
