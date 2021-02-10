import Express from 'express'
import Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'

import ImageFormat from '../../shared/util/image-format'
import { QrCodeController } from '../modules/qr'
import { isValidShortUrl } from '../../shared/util/validation'
import { container } from '../util/inversify'
import { DependencyIds } from '../constants'

const qrCodeController = container.get<QrCodeController>(
  DependencyIds.qrCodeController,
)

function isValidFormat(format: string): boolean {
  const validFormats = Object.values(ImageFormat) as string[]
  return validFormats.includes(format)
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
      const decodedFormat = decodeURIComponent(format)
      if (!isValidFormat(decodedFormat)) {
        return helpers.message({ custom: 'Not a valid format' })
      }
      return decodedFormat
    })
    .required(),
})

const router = Express.Router()
const validator = createValidator()

router.get(
  '/',
  validator.query(qrCodeRequestSchema),
  qrCodeController.createGoQrCode,
)

module.exports = router
