import Express from 'express'
import Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'

import { ogUrl } from '../config'
import createGoQrCode from '../util/qrcode'
import ImageFormat from '../../shared/util/imageFormat'
import { isValidShortUrl } from '../../shared/util/validation'

function isValidFormat(format: string): boolean {
  return (Object as any).values(ImageFormat).includes(format)
}

const qrCodeRequestSchema = Joi.object({
  url: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Not a valid short link' })
      }
      return url
    })
    .required(),
  format: Joi.string()
    .custom((format: string, helpers) => {
      if (!isValidFormat(format)) {
        return helpers.message({ custom: 'Not a valid format' })
      }
      return format
    })
    .required(),
})

const router = Express.Router()
const validator = createValidator()

router.post('/', validator.body(qrCodeRequestSchema), (req, res) => {
  const url = req.body.url as string
  const format = req.body.format as ImageFormat
  // Append base url to short link before creating the qr.
  const goShortLink = `${ogUrl}/${url}`
  // Creates the QR code and sends it to the client.
  createGoQrCode(goShortLink, format).then((buffer) => {
    res.contentType(format)
    res.end(buffer)
  })
})

module.exports = router
