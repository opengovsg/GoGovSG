import { injectable } from 'inversify'

import {
  DeviceCheckServiceInterface,
  DeviceType,
} from '../../../../src/server/services/interfaces/DeviceCheckServiceInterface'

@injectable()
export class DeviceCheckServiceMock implements DeviceCheckServiceInterface {
  getDeviceType: (userAgent: string) => DeviceType = () => 'desktop'
}

export default DeviceCheckServiceMock
