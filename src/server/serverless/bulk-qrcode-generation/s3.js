const { S3 } = require('aws-sdk')
const stream = require('stream')
const archiver = require('archiver')

const s3 = new S3()
const { BULK_GENERATION_BUCKET } = process.env
if (!BULK_GENERATION_BUCKET)
  throw Error('Environment variable for BULK_GENERATION_BUCKET is missing')

async function uploadToS3(fileBuffer, fileType, fileKey) {
  try {
    const params = {
      ContentType: fileType,
      Bucket: BULK_GENERATION_BUCKET,
      Body: fileBuffer,
      Key: fileKey,
    }

    await s3.putObject(params).promise()
    console.log(`Successfully uploaded ${fileKey}`)
  } catch (e) {
    throw Error(`Error uploading to S3 bucket: ${e}`)
  }
}

// https://stackoverflow.com/questions/37336050/pipe-a-stream-to-s3-upload
const streamToS3 = (key) => {
  const writeStream = new stream.PassThrough()
  const s3Promise = s3
    .upload({
      Bucket: BULK_GENERATION_BUCKET,
      Key: key,
      Body: writeStream,
      ContentType: 'application/zip',
      ServerSideEncryption: 'AES256',
    })
    .on('httpUploadProgress', (progress) => {
      console.log(progress)
    })
    .promise()
  return {
    writeStream,
    s3Promise,
  }
}

// Zip streams from system directory path to S3 path
async function archiverZipStreamToS3(systemPath, s3Path) {
  return new Promise((resolve, reject) => {
    const { writeStream, s3Promise } = streamToS3(s3Path)

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    })

    // upload to s3 is completed
    s3Promise
      .then(() => {
        console.log(`completed streaming from ${systemPath} to ${s3Path}`)
        resolve()
      })
      .catch((err) => {
        // upload error
        reject(err)
      })

    archive.on('error', (err) => {
      // stream error
      reject(err)
    })

    // where archiver stream writes to
    archive.pipe(writeStream)

    // where to archive from
    archive.directory(systemPath)
    archive.finalize()
  })
}

module.exports.uploadToS3 = uploadToS3
module.exports.streamToS3 = streamToS3
module.exports.archiverZipStreamToS3 = archiverZipStreamToS3
