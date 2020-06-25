import ImageFormat from '../../../shared/util/image-format'

export interface QrCodeServiceInterface {
  createGoQrCode: (url: string, format: ImageFormat) => Promise<Buffer>
}
