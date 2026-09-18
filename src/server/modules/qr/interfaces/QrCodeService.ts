import ImageFormat from '../../../../shared/util/image-format.js'

export interface QrCodeService {
  createGoQrCode: (url: string, format: ImageFormat) => Promise<Buffer>
}

export default QrCodeService
