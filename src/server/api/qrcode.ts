import Express from 'express'
import Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'

import ImageFormat from '../../shared/util/image-format'
import { ogUrl } from '../config'
import { QrCodeServiceInterface } from '../services/interfaces/QrCodeServiceInterface'
import { isValidShortUrl } from '../../shared/util/validation'
import { container } from '../util/inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../constants'

const urlRepository = container.get<UrlRepositoryInterface>(
  DependencyIds.urlRepository,
)

function isValidFormat(format: string): boolean {
  const validFormats = Object.values(ImageFormat) as string[]
  return validFormats.includes(format)
}

async function shortUrlExists(shortUrl: string): Promise<boolean> {
  return !!(await urlRepository.findByShortUrl(shortUrl))
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
  async (req, res): Promise<void> => {
    const url = req.query.url as string
    const format = req.query.format as ImageFormat

    if (!(await shortUrlExists(url))) {
      res.status(400).send('Short link does not exist')
      return
    }

    // Append base url to short link before creating the qr.
    const goShortLink = `${ogUrl}/${url}`

    const qrCodeService = container.get<QrCodeServiceInterface>(
      DependencyIds.qrCodeService,
    )

    // Creates the QR code and sends it to the client.
    qrCodeService.createGoQrCode(goShortLink, format).then((buffer) => {
      // Provides callee a proposed filename for image.
      res.set('Filename', goShortLink)
      res.contentType(format)
      res.end(buffer)
    })
  },
)

module.exports = router
