const qrCodeService = require('./qrCode')
const csvService = require('./csv')
const s3Service = require('./s3')
const httpService = require('./http')
const fsUtils = require('./fsUtils')
const { ImageFormat } = require('./qrCode')

async function handler(event) {
  const { body } = event.Records[0]
  const bodyJSON = JSON.parse(body)
  const { mappings, jobItemId } = bodyJSON

  if (!mappings || !jobItemId || mappings.length === 0) {
    throw Error(`Job params incomplete, ${bodyJSON}`)
  }

  try {
    const csvBuffer = await csvService.createCsv(mappings)
    await s3Service.uploadToS3(
      csvBuffer,
      'text/csv',
      `${jobItemId}/generated.csv`,
    )
    console.log(`uploaded csv to ${jobItemId}/generated.csv`)

    const svgTmpDirPath = `/tmp/${jobItemId}/svg`
    const svgS3ZipPath = `${jobItemId}/generated_svg.zip`
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

    const pngTmpDirPath = `/tmp/${jobItemId}/png`
    const pngS3ZipPath = `${jobItemId}/generated_png.zip`
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
    await fsUtils.fsRmdirRecursiveSync(`/tmp/${jobItemId}`)
    console.log(`cleaned up /tmp/${jobItemId}`)
  } catch (error) {
    // cleanup
    await fsUtils.fsRmdirRecursiveSync(`/tmp/${jobItemId}`)

    await httpService.sendHttpMessage(false, jobItemId, error)
    throw new Error(`Failed to generate files, Error: ${error} `)
  }

  await httpService.sendHttpMessage(true, jobItemId, '')
  return { Status: `Send success message for ${jobItemId}` }
}

module.exports.handler = handler
