const { S3 } = require('aws-sdk')

const s3 = new S3()
const bulkQrCodeBucket = process.env.BULK_QR_CODE_GENERATION
const fileAccessControlList = process.env.FILE_ACCESS_CONTROL_LIST

if (!bulkQrCodeBucket)
  throw Error('Environment variable for BulkQrCodeBucket is missing')

function uploadToS3(fileBuffer, fileType, fileKey) {
  try {
    const params = {
      ContentType: fileType,
      Bucket: bulkQrCodeBucket,
      Body: fileBuffer,
      Key: fileKey,
      ACL: fileAccessControlList,
    }
    s3.putObject(params).promise()
  } catch (e) {
    throw Error(`Error uploading to S3 bucket: ${e}`)
  }
}

module.exports.uploadToS3 = uploadToS3
