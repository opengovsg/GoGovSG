import ImageFormat from '../../../../shared/util/image-format'

export interface QrCodeService {
  createGoQrCode: (url: string, format: ImageFormat) => Promise<Buffer>
}

export default QrCodeService
