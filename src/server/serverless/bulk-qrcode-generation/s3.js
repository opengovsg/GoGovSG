const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const stream = require('stream')
const { ZipArchive } = require('archiver')

const s3 = new S3Client()
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

    await s3.send(new PutObjectCommand(params))
    console.log(`Successfully uploaded ${fileKey}`)
  } catch (e) {
    throw Error(`Error uploading to S3 bucket: ${e}`)
  }
}

// https://stackoverflow.com/questions/37336050/pipe-a-stream-to-s3-upload
const streamToS3 = (key) => {
  const writeStream = new stream.PassThrough()
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BULK_GENERATION_BUCKET,
      Key: key,
      Body: writeStream,
      ContentType: 'application/zip',
      ServerSideEncryption: 'AES256',
    },
  })
  upload.on('httpUploadProgress', (progress) => {
    console.log(progress)
  })
  const s3Promise = upload.done()
  return {
    writeStream,
    s3Promise,
  }
}

// Zip streams from system directory path to S3 path
async function archiverZipStreamToS3(systemPath, s3Path) {
  return new Promise((resolve, reject) => {
    const { writeStream, s3Promise } = streamToS3(s3Path)

    const archive = new ZipArchive({
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
        reject(
          new Error(`Error uploading from ${systemPath} to ${s3Path}: ${err}`),
        )
      })

    archive.on('error', (err) => {
      // stream error
      reject(new Error(`Error opening stream to s3: ${err}`))
    })

    // where archiver stream writes to
    archive.pipe(writeStream)

    // where to archive from
    // false appends files from systemPath into the root of archive
    // see https://github.com/archiverjs/node-archiver
    archive.directory(systemPath, false)
    archive.finalize()
  })
}

module.exports.uploadToS3 = uploadToS3
module.exports.archiverZipStreamToS3 = archiverZipStreamToS3
