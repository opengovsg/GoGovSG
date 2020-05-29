import jsQR from 'jsqr'
import png from 'upng-js'

import createGoQrCode from '../../../src/server/util/qrcode'
import ImageFormat from '../../../src/shared/util/imageFormat'

const testUrl = 'https://github.com/opengovsg/GoGovSG'

describe('GoGovSg QR code', () => {
  describe('generates accurately', () => {
    test('png string', async () => {
      const buffer = (await createGoQrCode(testUrl, ImageFormat.PNG)) as Buffer
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
