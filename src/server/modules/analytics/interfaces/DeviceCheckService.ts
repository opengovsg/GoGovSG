export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'others'

export interface DeviceCheckService {
  getDeviceType(userAgent: string): DeviceType
}
