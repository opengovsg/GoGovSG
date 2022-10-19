const cheerio = require('cheerio')
const fs = require('fs')
const QRCode = require('qrcode')

const { resolve } = require('path')
const sharp = require('sharp')
const archiver = require('archiver')

const { streamTo } = require('./s3')

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

const envVariant = process.env.ASSET_VARIANT

const domain = process.env.DOMAIN_URL

const assetVariants = ['gov', 'edu', 'health']
if (!assetVariants.includes(envVariant)) throw Error('Invalid variant name!')

const assetVariant = envVariant
const logoVariant = `qrlogo-${assetVariant}.svg`
const darkColorMap = {
  gov: '#384A51',
  edu: '#2B2E4A',
  health: '#472F40',
}
const dark = darkColorMap[assetVariant]

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
async function makeGoQrCode(shortUrl) {
  // Splits lines by 36 characters each.
  const lines = shortUrl.split(/(.{36})/).filter((O) => O)

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

  const qrString = await makeQrCode(shortUrl)
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

  // Return the result svg as string.
  return [Buffer.from(`${dom('body').html()}`), imageHeight]
}

// Build QR code of specified file format as a string or buffer.
async function createQRCodesBuffer(urls, format, filePath) {
  try {
    const extension =
      format === ImageFormat.SVG ? FileExtension.SVG : FileExtension.PNG

    const zipStream = streamTo(`${filePath}/generated_${extension}.zip`)

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    })
    archive.on('error', (err) => {
      throw new Error(err)
    })

    archive.pipe(zipStream)

    await Promise.all(
      urls.map(async (shortUrl, idx) => {
        const [qrSvgString, imageHeight] = await makeGoQrCode(
          `https://${domain}/${shortUrl}`,
        )

        if (format === ImageFormat.SVG) {
          archive.append(qrSvgString, {
            name: `qrcodes/${urls[idx]}.${extension}`,
          })
        } else if (format === ImageFormat.PNG) {
          const buffer = await sharp(Buffer.from(qrSvgString))
            .resize(IMAGE_WIDTH, imageHeight)
            .png()
            .toBuffer()
          archive.append(buffer, {
            name: `qrcodes/${urls[idx]}.${extension}`,
          })
        } else {
          throw Error('Invalid format')
        }
      }),
    )
    archive.finalize()
  } catch (error) {
    throw Error(`Zip stream error: ${error}`)
  }
}

module.exports.createQRCodesBuffer = createQRCodesBuffer
module.exports.ImageFormat = ImageFormat
