import { S3 } from 'aws-sdk'

export const s3 = new S3()

export const generatePresignedUrl = async (fileName: string, fileType: string) => {
  const params = {
    Bucket: 'file-staging.go.gov.sg',
    Key: fileName,
    ContentType: fileType,
    Expires: 60, // 60 seconds.
  }
  return s3.getSignedUrlPromise('putObject', params)
}
