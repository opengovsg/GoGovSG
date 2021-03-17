import jsQR from 'jsqr'
import png from 'upng-js'

import ImageFormat from '../../../../../shared/util/image-format'

import { QrCodeService } from '..'

const testUrl = 'https://github.com/opengovsg/GoGovSG'

describe('GoGovSg QR code', () => {
  describe('generates accurately', () => {
    const qrCodeService = new QrCodeService()

    test('png string', async () => {
      const buffer = await qrCodeService.createGoQrCode(
        testUrl,
        ImageFormat.PNG,
      )
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
