import { S3 } from 'aws-sdk'
import { s3Bucket } from '../config'

// Enums for S3 object ACL toggling. Do not change string representations.
export enum FileVisibility {
  Public = 'public-read',
  Private = 'private',
}

export const s3 = new S3()

export const setS3ObjectACL = (
  key: string,
  acl: FileVisibility,
): Promise<any> => {
  const params = {
    Bucket: s3Bucket,
    Key: key,
    ACL: acl,
  }
  return s3.putObjectAcl(params).promise()
}

export const uploadFileToS3 = async (
  file: Buffer,
  key: string,
  fileType: string,
) => {
  const params = {
    ContentType: fileType,
    Bucket: s3Bucket,
    Body: file,
    Key: key,
    ACL: FileVisibility.Public,
  }
  return s3.putObject(params).promise()
}
