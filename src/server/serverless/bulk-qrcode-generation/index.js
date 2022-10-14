const { ImageFormat, createQRCodesBuffer } = require('./qrCode')
const { createCsv } = require('./createCsv')
const { uploadToS3 } = require('./s3')
const { sendSQSMessage } = require('./sqs')

async function handler(event) {
  const { body } = event.Records[0]
  const bodyJSON = JSON.parse(body)
  const { mappings, filePath } = bodyJSON
  try {
    let bufferData = await createCsv(mappings)
    await uploadToS3(bufferData, 'text/csv', `${filePath}/generated.csv`)

    bufferData = await createQRCodesBuffer(
      mappings.map((mapping) => mapping.shortUrl),
      ImageFormat.SVG,
    )
    await uploadToS3(
      bufferData,
      'application/zip',
      `${filePath}/generated_svg.zip`,
    )

    // bufferData = await createQRCodesBuffer(
    //   mappings.map((mapping) => mapping.shortUrl),
    //   ImageFormat.PNG,
    // )
    // await uploadToS3(bufferData, 'application/zip', `${filePath}/generated_png.zip`)

    console.log(`Uploaded files to ${filePath}`)

    await sendSQSMessage(true, filePath, '')
    return { Status: `Send success message to sqs for ${filePath}` }
  } catch (error) {
    await sendSQSMessage(false, filePath, error)
    return {
      Status: `Failed to upload files to ${filePath} and send failed message to sqs, Error: ${error} `,
    }
  }
}

module.exports.handler = handler
