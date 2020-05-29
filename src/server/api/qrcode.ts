import Express from 'express'

import createGoQrCode from '../util/qrcode'
import ImageFormat from '../../shared/util/imageFormat'

const router = Express.Router()

router.post('/', (req, res) => {
  const url = req.body.url as string
  const format = req.body.format as ImageFormat
  if (!url || !format) {
    res
      .status(400)
      .send('Please include the required "url" and "format" headers')
    return
  }
  // Creates the QR code and sends it to the client.
  createGoQrCode(url, format).then((buffer) => {
    res.contentType(format)
    res.end(buffer)
  })
})

module.exports = router
