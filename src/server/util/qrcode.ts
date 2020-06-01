import jsdom from 'jsdom'
import { select } from 'd3'
import fs from 'fs'
import QRCode from 'qrcode'
import { resolve } from 'path'
import util from 'util'
import sharp from 'sharp'
import filenamify from 'filenamify'

import ImageFormat from '../../shared/util/imageFormat'

const { JSDOM } = jsdom

export const IMAGE_WIDTH = 1000
export const QR_CODE_DIMENSIONS = 800
export const MARGIN_VERTICAL = 85
export const FONT_SIZE = 32
export const LINE_HEIGHT = 1.35

// Convert readFile callback function to promise function.
const readFile = util.promisify(fs.readFile)

// Build base QR code string without logo.
async function makeQrCode(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#384A51',
    },
  })
}

// Build QR code string with GoGovSg logo.
async function makeGoQrCode(url: string): Promise<[Buffer, number]> {
  // Splits lines by 36 characters each.
  const lines = url.split(/(.{36})/).filter((O) => O)

  // Calculate image height using the length of the url.
  // Rounded of to next integer as required by sharp.
  const imageHeight = Math.ceil(
    MARGIN_VERTICAL +
      QR_CODE_DIMENSIONS +
      MARGIN_VERTICAL +
      lines.length * FONT_SIZE * LINE_HEIGHT +
      MARGIN_VERTICAL,
  )

  const qrString = await makeQrCode(url)
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`)

  // Read the logo as a string.
  const filePath = resolve(__dirname, 'assets/qrlogo.svg')
  const logoSvg = await readFile(filePath, 'utf-8')

  const body = select(dom.window.document.querySelector('body'))

  const svg = body
    .append('svg')
    .attr('width', IMAGE_WIDTH)
    .attr('height', imageHeight)
    .attr('xmlns', 'http://www.w3.org/2000/svg')

  // Provides the entire graphic with a white background.
  svg
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', '#ffffff')

  // Append generated qr code to jsdom.
  const qrCodeOffsetX = (IMAGE_WIDTH - QR_CODE_DIMENSIONS) / 2
  svg
    .append('svg')
    .attr('x', qrCodeOffsetX)
    .attr('y', MARGIN_VERTICAL)
    .attr('viewBox', `0 0 ${QR_CODE_DIMENSIONS} ${QR_CODE_DIMENSIONS}`)
    .attr('width', QR_CODE_DIMENSIONS)
    .attr('height', QR_CODE_DIMENSIONS)
    .html(qrString)

  // Append go logo to the qrcode on jsdom.
  const logoDimensions = 0.35 * QR_CODE_DIMENSIONS
  const logoOffsetX = (IMAGE_WIDTH - logoDimensions) / 2
  const logoOffsetY =
    MARGIN_VERTICAL + (QR_CODE_DIMENSIONS - logoDimensions) / 2

  svg
    .append('svg')
    .attr('x', logoOffsetX)
    .attr('y', logoOffsetY)
    .attr('viewBox', `0 0 ${logoDimensions} ${logoDimensions}`)
    .attr('width', logoDimensions)
    .attr('height', logoDimensions)
    .html(logoSvg)

  // Append the relevant shortlink to the bottom of the qrcode.
  const textLocationX = IMAGE_WIDTH / 2
  const textLocationY = 2 * MARGIN_VERTICAL + QR_CODE_DIMENSIONS

  svg
    .selectAll('text')
    .data(lines)
    .enter()
    .append('text')
    .attr('x', textLocationX)
    .attr('y', (_, i) => {
      return textLocationY + i * FONT_SIZE * LINE_HEIGHT
    })
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('font-weight', '400')
    .attr('font-size', `${FONT_SIZE}px`)
    .text((d) => {
      return d
    })

  // Return the result svg as string.
  return [Buffer.from(body.html()), imageHeight]
}

// Build QR code of specified file format as a string or buffer.
export default async function createGoQrCode(
  url: string,
  format: ImageFormat,
): Promise<Buffer> {
  const [qrSvgString, imageHeight] = await makeGoQrCode(url)
  switch (format) {
    case ImageFormat.SVG: {
      return qrSvgString
    }
    case ImageFormat.PNG: {
      const buffer = Buffer.from(qrSvgString)
      return sharp(buffer).resize(IMAGE_WIDTH, imageHeight).png().toBuffer()
    }
    case ImageFormat.JPEG: {
      const buffer = Buffer.from(qrSvgString)
      return sharp(buffer).resize(IMAGE_WIDTH, imageHeight).jpeg().toBuffer()
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
      sharp(qrcode).toFile(`${outFileName}.png`, console.error)
      break
    case ImageFormat.JPEG:
      sharp(qrcode).toFile(`${outFileName}.jpg`, console.error)
      break
    default:
      throw Error('Invalid format')
  }
}
