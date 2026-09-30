import createCsv from './csv.js'
import { fsMkdirOverwriteSync, fsRmdirRecursiveSync } from './fsUtils.js'
import sendHttpMessage from './http.js'
import { ImageFormat, shortUrlsToQRCodeFiles } from './qrCode.js'
import { archiverZipStreamToS3, uploadToS3 } from './s3.js'

// Lambda invokes the named export from index.handler, not the default export.
// eslint-disable-next-line import/prefer-default-export
export async function handler(event) {
  const { body } = event.Records[0]
  const bodyJSON = JSON.parse(body)
  const { mappings, jobItemId } = bodyJSON

  if (!mappings || !jobItemId || mappings.length === 0) {
    throw Error(`Job params incomplete, ${bodyJSON}`)
  }

  try {
    const csvBuffer = await createCsv(mappings)
    await uploadToS3(csvBuffer, 'text/csv', `${jobItemId}/generated.csv`)
    console.log(`uploaded csv to ${jobItemId}/generated.csv`)

    const svgTmpDirPath = `/tmp/${jobItemId}/svg`
    const svgS3ZipPath = `${jobItemId}/generated_svg.zip`
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

    const pngTmpDirPath = `/tmp/${jobItemId}/png`
    const pngS3ZipPath = `${jobItemId}/generated_png.zip`
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
    await fsRmdirRecursiveSync(`/tmp/${jobItemId}`)
    console.log(`cleaned up /tmp/${jobItemId}`)
  } catch (error) {
    // cleanup
    await fsRmdirRecursiveSync(`/tmp/${jobItemId}`)

    await sendHttpMessage(false, jobItemId, error.message)
    throw new Error(`Failed to generate files, Error: ${error} `)
  }

  await sendHttpMessage(true, jobItemId, '')
  return { Status: `Send success message for ${jobItemId}` }
}
