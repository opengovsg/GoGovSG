import Express from 'express'
import { z } from 'zod'

import ImageFormat from '../../shared/util/image-format.js'
import { QrCodeController } from '../modules/qr/index.js'
import { isValidShortUrl } from '../../shared/util/validation.js'
import { container } from '../util/inversify.js'
import { DependencyIds } from '../constants.js'
import { createValidator } from '../util/zodValidator.js'

const qrCodeController = container.get<QrCodeController>(
  DependencyIds.qrCodeController,
)

function isValidFormat(format: string): boolean {
  const validFormats = Object.values(ImageFormat) as string[]
  return validFormats.includes(format)
}

const qrCodeRequestSchema = z.object({
  url: z.string().superRefine((url, ctx) => {
    if (!isValidShortUrl(url)) {
      ctx.addIssue({ code: 'custom', message: 'Not a valid short link' })
    }
  }),
  format: z
    .string()
    .transform((format) => decodeURIComponent(format))
    .superRefine((decodedFormat, ctx) => {
      if (!isValidFormat(decodedFormat)) {
        ctx.addIssue({ code: 'custom', message: 'Not a valid format' })
      }
    }),
})

const router = Express.Router()
const validator = createValidator()

router.get(
  '/',
  validator.query(qrCodeRequestSchema),
  qrCodeController.createGoQrCode,
)

export default router
