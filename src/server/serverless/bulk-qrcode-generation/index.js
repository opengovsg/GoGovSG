const qrCodeService = require('./qrCode')
const csvService = require('./csv')
const s3Service = require('./s3')
const snsService = require('./sns')
const fsUtils = require('./fsUtils')
const { ImageFormat } = require('./qrCode')

async function handler(event) {
  const { body } = event.Records[0]
  const bodyJSON = JSON.parse(body)
  const { mappings, filePath } = bodyJSON

  try {
    const csvBuffer = await csvService.createCsv(mappings)
    await s3Service.uploadToS3(
      csvBuffer,
      'text/csv',
      `${filePath}/generated.csv`,
    )
    console.log(`uploaded csv to ${filePath}/generated.csv`)

    const svgTmpDirPath = `/tmp/${filePath}/svg`
    const svgS3ZipPath = `${filePath}/generated_svg.zip`
    await fsUtils.fsMkdirOverwriteSync(svgTmpDirPath)

    // generate QR code svg file and saves in svgTmpDirPath
    await qrCodeService.shortUrlsToQRCodeFiles(
      mappings.map((mapping) => mapping.shortUrl),
      ImageFormat.SVG,
      svgTmpDirPath,
    )
    // upload svgTmpDirPath in zip stream to svgS3ZipPath
    await s3Service.archiverZipStreamToS3(svgTmpDirPath, svgS3ZipPath)
    console.log(`uploaded svg zip to ${svgS3ZipPath}`)

    const pngTmpDirPath = `/tmp/${filePath}/png`
    const pngS3ZipPath = `${filePath}/generated_png.zip`
    await fsUtils.fsMkdirOverwriteSync(pngTmpDirPath)

    // generate QR code png file and saves in pngTmpDirPath
    await qrCodeService.shortUrlsToQRCodeFiles(
      mappings.map((mapping) => mapping.shortUrl),
      ImageFormat.PNG,
      pngTmpDirPath,
    )
    // upload pngTmpDirPath in zip stream to pngS3ZipPath
    await s3Service.archiverZipStreamToS3(pngTmpDirPath, pngS3ZipPath)
    console.log(`uploaded png zip to ${pngS3ZipPath}`)

    // cleanup
    await fsUtils.fsRmdirRecursiveSync(`/tmp/${filePath}`)
    console.log(`cleaned up /tmp/${filePath}`)

    await snsService.sendSNSMessage(true, filePath, '')
    return { Status: `Send success message to SNS for ${filePath}` }
  } catch (error) {
    // cleanup
    await fsUtils.fsRmdirRecursiveSync(`/tmp/${filePath}`)

    await snsService.sendSNSMessage(false, filePath, error)
    throw Error(`Failed to generate files, Error: ${error} `)
  }
}

module.exports.handler = handler
