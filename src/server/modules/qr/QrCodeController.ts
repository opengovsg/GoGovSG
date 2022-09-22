import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import jszip from 'jszip'
// eslint-disable-next-line import/no-extraneous-dependencies
import png from 'upng-js'
import { UrlRepositoryInterface } from '../../repositories/interfaces/UrlRepositoryInterface'

import ImageFormat from '../../../shared/util/image-format'
import { DependencyIds } from '../../constants'

import { QrCodeService } from './interfaces'

@injectable()
export class QrCodeController {
  private ogUrl: string

  private qrCodeService: QrCodeService

  private urlRepository: UrlRepositoryInterface

  constructor(
    @inject(DependencyIds.ogUrl) ogUrl: string,
    @inject(DependencyIds.qrCodeService) qrCodeService: QrCodeService,
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
  ) {
    this.ogUrl = ogUrl
    this.qrCodeService = qrCodeService
    this.urlRepository = urlRepository
  }

  private shortUrlExists: (shortUrl: string) => Promise<boolean> = async (
    shortUrl,
  ) => {
    return !!(await this.urlRepository.findByShortUrlWithTotalClicks(shortUrl))
  }

  private randomString = (length = 10): string => {
    return Math.random().toString(16).substring(2, length)
  }

  createGoQrCode: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ): Promise<void> => {
    const url = req.query.url as string
    const format = req.query.format as ImageFormat

    if (!(await this.shortUrlExists(url))) {
      res.status(400).send('Short link does not exist')
      return
    }

    // Append base url to short link before creating the qr.
    const goShortLink = `${this.ogUrl}/${url}`

    // Creates the QR code and sends it to the client.
    const buffer = await this.qrCodeService.createGoQrCode(goShortLink, format)

    const startTime = Date.now()
    const shortLinks: string[] = []
    for (let i = 0; i < 1; i += 1) {
      shortLinks.push(`${this.ogUrl}/${this.randomString(10)}`)
    }

    // Creates the QR code and sends it to the client.
    const buffers = await Promise.all(
      shortLinks.map((link) => this.qrCodeService.createGoQrCode(link, format)),
    )
    const pngImages = await Promise.all(
      buffers.map((buffer) => png.decode(buffer)),
    )
    const zippp = jszip()
    pngImages.forEach((image, idx) => zippp.file(`image${idx}`, image.data))
    if (jszip.support.uint8array) {
      zippp.generateAsync({ type: 'uint8array' })
    } else {
      zippp.generateAsync({ type: 'string' })
    }
    const endTime = Date.now()
    console.log(`took ${endTime - startTime} to run`)
    console.log(`array length = ${pngImages.length}`)

    res.set('Filename', goShortLink)
    res.contentType(format)
    res.end(buffer)
  }
}

export default QrCodeController
