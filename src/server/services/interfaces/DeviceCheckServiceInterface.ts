export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'others'

export interface DeviceCheckServiceInterface {
  getDeviceType(userAgent: string): DeviceType
}
