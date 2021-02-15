import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
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
    // Provides callee a proposed filename for image.
    res.set('Filename', goShortLink)
    res.contentType(format)
    res.end(buffer)
  }
}

export default QrCodeController
