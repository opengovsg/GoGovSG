const cheerio = require('cheerio')
const fs = require('fs')
const QRCode = require('qrcode')

const { resolve } = require('path')
const sharp = require('sharp')

const IMAGE_WIDTH = 1000
const QR_CODE_DIMENSIONS = 800
const MARGIN_VERTICAL = 85
const FONT_SIZE = 32
const LINE_HEIGHT = 1.35

const ImageFormat = {
  SVG: 'image/svg+xml',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
}

const FileExtension = {
  SVG: 'svg',
  PNG: 'png',
  JPEG: 'jpeg',
}

const { ASSET_VARIANT } = process.env
const { DOMAIN } = process.env
if (!ASSET_VARIANT)
  throw Error('Environment variable for ASSET_VARIANT is missing')
if (!DOMAIN) throw Error('Environment variable for DOMAIN is missing!')

const ASSET_VARIANTS = ['gov', 'edu', 'health']
if (!ASSET_VARIANTS.includes(ASSET_VARIANT))
  throw Error('Invalid variant name!')

const logoVariant = `qrlogo-${ASSET_VARIANT}.svg`
const darkColorMap = {
  gov: '#384A51',
  edu: '#2B2E4A',
  health: '#472F40',
}
const dark = darkColorMap[ASSET_VARIANT]

// Build base QR code string without logo.
function makeQrCode(url) {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'H',
    color: {
      dark,
    },
  })
}

// Build QR code string with GoGovSg/ForSg/ForEduSg logo.
async function makeGoQrCode(shortUrl, format, domain = DOMAIN) {
  const url = `https://${domain}/${shortUrl}`
  // Splits lines by 36 characters each.
  const lines = url.split(/(.{36})/).filter((O) => O)

  // Calculate image height using the length of the url.
  // Rounded of to next integer as required by sharp.
  const imageHeight = Math.ceil(
    MARGIN_VERTICAL +
      QR_CODE_DIMENSIONS +
      MARGIN_VERTICAL +
      (lines.length - 1) * FONT_SIZE * LINE_HEIGHT +
      FONT_SIZE +
      MARGIN_VERTICAL,
  )

  const qrString = await makeQrCode(url)
  const dom = cheerio.load('')

  // Read the logo as a string.
  const filePath = resolve(__dirname, `./assets/${logoVariant}`)
  const logoSvg = fs.readFileSync(filePath, 'utf-8')

  dom('body').append('<svg></svg>')
  const svg = dom('svg')
    .attr('width', `${IMAGE_WIDTH}`)
    .attr('height', `${imageHeight}`)
    .attr('xmlns', 'http://www.w3.org/2000/svg')

  // Sources IBM Plex Sans font from Google Fonts and defines the text style.
  // This only affects QRCodes that are exported to SVGs.
  // Note that sharp sources the font file from the Docker container that the
  // instance is run on. Refer to Dockerfile for the installation.
  svg.append(
    `<defs>
        <style type="text/css">
          @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans&amp;display=swap");
        </style>
      </defs>`,
  )

  // Provides the entire graphic with a white background.
  svg.append('<rect></rect>')
  dom('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', '#ffffff')

  // Append generated qr code to jsdom.
  const qrCodeOffsetX = (IMAGE_WIDTH - QR_CODE_DIMENSIONS) / 2

  const qrDOM = cheerio.load('')
  qrDOM('body').append('<svg></svg>')
  qrDOM('svg')
    .attr('x', `${qrCodeOffsetX}`)
    .attr('y', `${MARGIN_VERTICAL}`)
    .attr('viewBox', `0 0 ${QR_CODE_DIMENSIONS} ${QR_CODE_DIMENSIONS}`)
    .attr('width', `${QR_CODE_DIMENSIONS}`)
    .attr('height', `${QR_CODE_DIMENSIONS}`)
    .html(qrString)

  svg.append(`${qrDOM('body').html()}`)

  // Append logo to the qrcode on jsdom.
  const logoDom = cheerio.load(logoSvg)
  const logoWidth = logoDom('svg').attr('width')
  const logoHeight = logoDom('svg').attr('height')

  const logoOffsetX = (IMAGE_WIDTH - logoWidth) / 2
  const logoOffsetY = MARGIN_VERTICAL + (QR_CODE_DIMENSIONS - logoHeight) / 2

  const goLogoDOM = cheerio.load('')
  goLogoDOM('body').append('<svg></svg>')
  goLogoDOM('svg')
    .attr('x', logoOffsetX.toString())
    .attr('y', logoOffsetY.toString())
    .attr('viewBox', `0 0 ${logoWidth} ${logoHeight}`)
    .attr('width', logoWidth.toString())
    .attr('height', logoHeight.toString())
    .html(logoSvg)

  svg.append(`${goLogoDOM('body').html()}`)

  // Append the relevant shortlink to the bottom of the qrcode.
  const textLocationX = IMAGE_WIDTH / 2
  const textLocationY = 2 * MARGIN_VERTICAL + QR_CODE_DIMENSIONS

  lines.forEach((line, i) => {
    const linkDOM = cheerio.load('')
    linkDOM('body').append('<text></text>')
    linkDOM('text')
      .attr('x', `${textLocationX}`)
      .attr('y', `${textLocationY + i * FONT_SIZE * LINE_HEIGHT}`)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'IBM Plex Sans, sans-serif')
      .attr('font-weight', '400')
      .attr('font-size', `${FONT_SIZE}px`)
      .text(line)

    svg.append(`${linkDOM('body').html()}`)
  })

  const qrSvgString = Buffer.from(`${dom('body').html()}`)

  const buffer =
    format === ImageFormat.SVG
      ? qrSvgString
      : await sharp(Buffer.from(qrSvgString))
          .resize(IMAGE_WIDTH, imageHeight)
          .png()
          .toBuffer()
  // Return the qrCode as buffer
  return buffer
}

async function shortUrlsToQRCodeFiles(shortUrls, format, saveDir) {
  const extension =
    format === ImageFormat.SVG ? FileExtension.SVG : FileExtension.PNG

  await Promise.all(
    shortUrls.map(async (shortUrl) => {
      const buffer = await makeGoQrCode(shortUrl, format)
      const filePath = `${saveDir}/${shortUrl}.${extension}`
      try {
        fs.writeFileSync(filePath, buffer)
      } catch (err) {
        throw new Error(
          `Unable to write file ${shortUrl}.${extension}, error: ${err}`,
        )
      }
    }),
  )

  console.log(
    `created ${shortUrls.length} ${extension} files and saved to ${saveDir}`,
  )
}

module.exports.shortUrlsToQRCodeFiles = shortUrlsToQRCodeFiles
module.exports.ImageFormat = ImageFormat
