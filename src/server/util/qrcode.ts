import jsdom from 'jsdom'
import { select } from 'd3'
import fs from 'fs'
import QRCode from 'qrcode'
import { resolve } from 'path'
import util from 'util'

const { JSDOM } = jsdom

const QR_CODE_DIMENSIONS = 1000

const readFile = util.promisify(fs.readFile)

async function makeGoQrCode(url: string) {
  const qrString = await QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'H',
  })

  const dom = new JSDOM(`<!DOCTYPE html><body></body>`)

  const filePath = resolve(__dirname, 'assets/qrlogo.svg')

  // Read the logo as a string.
  const contents = await readFile(filePath, 'utf-8')

  const body = select(dom.window.document.querySelector('body'))

  const svg = body
    .append('svg')
    .attr('width', QR_CODE_DIMENSIONS)
    .attr('height', QR_CODE_DIMENSIONS)
    .attr('xmlns', 'http://www.w3.org/2000/svg')

  // Append generated qr code to jsdom.
  svg.append('svg').html(qrString)

  // Calculate relevant dimensions for logo.
  const logoDimensions = 0.35 * QR_CODE_DIMENSIONS
  const logoOffsets = (QR_CODE_DIMENSIONS - logoDimensions) / 2

  // Append go logo to the qr code on jsdom.
  svg
    .append('svg')
    .attr('x', logoOffsets)
    .attr('y', logoOffsets)
    .attr('width', logoDimensions)
    .attr('height', logoDimensions)
    .html(contents)

  // Return the result svg as string.
  return body.html()
}

// Takes in a svg string and downloads it as svg locally.
function downloadSvgFromString(svgString: string) {
  fs.writeFileSync(`out.svg`, svgString)
}

// Create and downloads a qr code locally.
makeGoQrCode('https://go.gov.sg').then((svgString) => {
  downloadSvgFromString(svgString)
})
