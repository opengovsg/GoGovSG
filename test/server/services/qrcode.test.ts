import jsQR from 'jsqr'
import png from 'upng-js'

import ImageFormat from '../../../src/shared/util/image-format'
import { container } from '../../../src/server/util/inversify'
import { DependencyIds } from '../../../src/server/constants'
import { QrCodeServiceInterface } from '../../../src/server/services/interfaces/QrCodeServiceInterface'
import { QrCodeService } from '../../../src/server/services/QrCodeService'

const testUrl = 'https://github.com/opengovsg/GoGovSG'

describe('GoGovSg QR code', () => {
  describe('generates accurately', () => {
    afterEach(() => {
      container.unbindAll()
    })
    beforeEach(() => {
      container
        .bind<QrCodeServiceInterface>(DependencyIds.qrCodeService)
        .to(QrCodeService)
    })

    test('png string', async () => {
      const qrCodeService = container.get<QrCodeServiceInterface>(
        DependencyIds.qrCodeService,
      )
      const buffer = (await qrCodeService.createGoQrCode(
        testUrl,
        ImageFormat.PNG,
      )) as Buffer
      const data = png.decode(buffer)
      const out = {
        data: new Uint8ClampedArray(png.toRGBA8(data)[0]),
        height: data.height,
        width: data.width,
      }
      const code = jsQR(out.data, out.width, out.height)
      expect(code).not.toBeNull()
      expect(code!.data).toEqual(testUrl)
    })
  })
})
