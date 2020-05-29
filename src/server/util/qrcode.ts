import jsdom from 'jsdom'
import { select } from 'd3'
import fs from 'fs'
import QRCode from 'qrcode'
// import { resolve } from 'path'
// import util from 'util'
import sharp from 'sharp'
import filenamify from 'filenamify'

import ImageFormat from '../../shared/util/imageFormat'

const { JSDOM } = jsdom

export const QR_CODE_DIMENSIONS = 1000

// const readFile = util.promisify(fs.readFile)

// Build base QR code string without logo.
async function makeQrCode(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#384A51',
    },
  })
}

// Build QR code string with GoGovSg logo.
async function makeGoQrCode(url: string): Promise<Buffer> {
  const qrString = await makeQrCode(url)
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`)

  // Read the logo as a string.
  // const filePath = resolve(__dirname, 'assets/qrlogo.svg')
  // const contents = await readFile(filePath, 'utf-8')

  const body = select(dom.window.document.querySelector('body'))

  const svg = body
    .append('svg')
    .attr('width', QR_CODE_DIMENSIONS)
    .attr('height', QR_CODE_DIMENSIONS)
    .attr('xmlns', 'http://www.w3.org/2000/svg')

  // Append generated qr code to jsdom.
  svg.append('svg').html(qrString)

  // // Calculate relevant dimensions for logo.
  // const logoDimensions = 0.35 * QR_CODE_DIMENSIONS
  // const logoOffsets = (QR_CODE_DIMENSIONS - logoDimensions) / 2

  // // Append go logo to the qr code on jsdom.
  // svg
  //   .append('svg')
  //   .attr('x', logoOffsets)
  //   .attr('y', logoOffsets)
  //   .attr('width', logoDimensions)
  //   .attr('height', logoDimensions)
  //   .html(contents)

  // Return the result svg as string.
  return Buffer.from(body.html())
}

// Build QR code of specified file format as a string or buffer.
export default async function createGoQrCode(
  url: string,
  format: ImageFormat,
): Promise<Buffer> {
  const qrSvgString = await makeGoQrCode(url)
  switch (format) {
    case ImageFormat.SVG: {
      return qrSvgString
    }
    case ImageFormat.PNG: {
      const buffer = Buffer.from(qrSvgString)
      return sharp(buffer)
        .resize(QR_CODE_DIMENSIONS, QR_CODE_DIMENSIONS)
        .png()
        .toBuffer()
    }
    case ImageFormat.JPEG: {
      const buffer = Buffer.from(qrSvgString)
      return sharp(buffer)
        .resize(QR_CODE_DIMENSIONS, QR_CODE_DIMENSIONS)
        .jpeg()
        .toBuffer()
    }
    default:
      throw Error('Invalid format')
  }
}

// Generates and download a QR code using a specified url and format.
export async function downloadGoQrCode(url: string, format: ImageFormat) {
  const qrcode = await createGoQrCode(url, format)
  const outFileName = filenamify(url)
  switch (format) {
    case ImageFormat.SVG:
      fs.writeFileSync(`${outFileName}.svg`, qrcode)
      break
    case ImageFormat.PNG:
      sharp(qrcode).toFile(`${outFileName}.png`)
      break
    case ImageFormat.JPEG:
      sharp(qrcode).toFile(`${outFileName}.jpg`)
      break
    default:
      throw Error('Invalid format')
  }
}
