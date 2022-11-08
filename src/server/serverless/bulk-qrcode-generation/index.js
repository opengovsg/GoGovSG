const { ImageFormat, shortUrlsToQRCodeFiles } = require('./qrCode')
const { createCsv } = require('./csv')
const { uploadToS3, archiverZipStreamToS3 } = require('./s3')
const { sendSNSMessage } = require('./sns')
const { fsMkdirOverwriteSync, fsRmdirRecursiveSync } = require('./fsUtils')

async function handler(event) {
  const { body } = event.Records[0]
  const bodyJSON = JSON.parse(body)
  const { mappings, filePath } = bodyJSON

  try {
    const csvBuffer = await createCsv(mappings)
    await uploadToS3(csvBuffer, 'text/csv', `${filePath}/generated.csv`)
    console.log(`uploaded csv to ${filePath}/generated.csv`)

    const svgTmpDirPath = `/tmp/${filePath}/svg`
    const svgS3ZipPath = `${filePath}/generated_svg.zip`
    await fsMkdirOverwriteSync(svgTmpDirPath)
    // generate QR code svg file and saves in svgTmpDirPath
    await shortUrlsToQRCodeFiles(
      mappings.map((mapping) => mapping.shortUrl),
      ImageFormat.SVG,
      svgTmpDirPath,
    )
    // upload svgTmpDirPath in zip stream to svgS3ZipPath
    await archiverZipStreamToS3(svgTmpDirPath, svgS3ZipPath)
    console.log(`uploaded svg zip to ${svgS3ZipPath}`)

    const pngTmpDirPath = `/tmp/${filePath}/png`
    const pngS3ZipPath = `${filePath}/generated_png.zip`
    await fsMkdirOverwriteSync(pngTmpDirPath)
    // generate QR code png file and saves in pngTmpDirPath
    await shortUrlsToQRCodeFiles(
      mappings.map((mapping) => mapping.shortUrl),
      ImageFormat.PNG,
      pngTmpDirPath,
    )
    // upload pngTmpDirPath in zip stream to pngS3ZipPath
    await archiverZipStreamToS3(pngTmpDirPath, pngS3ZipPath)
    console.log(`uploaded png zip to ${pngS3ZipPath}`)

    // cleanup
    await fsRmdirRecursiveSync(`/tmp/${filePath}`)
    console.log(`cleaned up /tmp/${filePath}`)

    await sendSNSMessage(true, filePath, '')
    return { Status: `Send success message to SNS for ${filePath}` }
  } catch (error) {
    await sendSNSMessage(false, filePath, error)
    throw Error(`Failed to generate files, Error: ${error} `)
  }
}

module.exports.handler = handler
