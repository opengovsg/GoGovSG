const { S3 } = require('aws-sdk')
const stream = require('stream')

const s3 = new S3()
const bulkQrCodeBucket = process.env.BULK_QR_CODE_GENERATION

if (!bulkQrCodeBucket)
  throw Error('Environment variable for BulkQrCodeBucket is missing')

async function uploadToS3(fileBuffer, fileType, fileKey) {
  try {
    const params = {
      ContentType: fileType,
      Bucket: bulkQrCodeBucket,
      Body: fileBuffer,
      Key: fileKey,
    }

    await s3.putObject(params).promise()
    console.log(`Successfully uploaded ${fileKey}`)
  } catch (e) {
    throw Error(`Error uploading to S3 bucket: ${e}`)
  }
}

// https://gist.github.com/amiantos/16bacc9ed742c91151fcf1a41012445e

const streamTo = (key) => {
  const passthrough = new stream.PassThrough()
  s3.upload(
    {
      Bucket: bulkQrCodeBucket,
      Key: key,
      Body: passthrough,
      ContentType: 'application/zip',
      ServerSideEncryption: 'AES256',
    },
    (err) => {
      if (err) throw err
      console.log('Zip uploaded')
    },
  ).on('httpUploadProgress', (progress) => {
    console.log(progress)
  })
  return passthrough
}

module.exports.uploadToS3 = uploadToS3
module.exports.streamTo = streamTo
