/* eslint-disable import/prefer-default-export */
import { injectable } from 'inversify'
import AWS from 'aws-sdk'

import { FileVisibility, S3Interface } from './aws'
import { logger } from '../config'

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'local-bucket'
export const BUCKET_ENDPOINT = 'http://localstack:4572'
export const ACCESS_ENDPOINT = 'http://localhost:4572'

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: 'foobar',
    secretAccessKey: 'foobar',
  },
  endpoint: BUCKET_ENDPOINT,
  s3ForcePathStyle: true,
})

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["setS3ObjectACL", "uploadFileToS3", "buildFileLongUrl", "getKeyFromLongUrl"] }] */
export class S3LocalDev implements S3Interface {
  setS3ObjectACL(key: string, acl: FileVisibility) {
    logger.info(`Setting file ACL to ${acl}`)
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ACL: acl,
    }
    const result = s3.putObjectAcl(params).promise()
    return result
  }

  uploadFileToS3(file: Buffer, key: string, fileType: string) {
    logger.warn('Your file will be uploaded to localstack rather than AWS S3')
    const params = {
      ContentType: fileType,
      Bucket: BUCKET_NAME,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public,
      CacheControl: `no-cache`,
    }
    return s3.putObject(params).promise()
  }

  buildFileLongUrl(key: string): string {
    return `${ACCESS_ENDPOINT}/${BUCKET_NAME}/${key}`
  }

  getKeyFromLongUrl(longUrl: string): string {
    const key = longUrl.split('/').pop()
    if (!key) throw new Error('Invalid URL')
    return key
  }
}
