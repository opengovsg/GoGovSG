/* eslint-disable import/prefer-default-export */
import { injectable } from 'inversify'
import AWS from 'aws-sdk'

import { FileVisibility, S3Interface } from './aws'
import { accessEndpoint, bucketEndpoint, logger, s3Bucket } from '../config'

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: 'foobar',
    secretAccessKey: 'foobar',
  },
  endpoint: bucketEndpoint,
  s3ForcePathStyle: true,
})

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["setS3ObjectACL", "uploadFileToS3", "buildFileLongUrl", "getKeyFromLongUrl"] }] */
export class S3LocalDev implements S3Interface {
  setS3ObjectACL(key: string, acl: FileVisibility) {
    logger.info(`Setting file ACL to ${acl}`)
    const params = {
      Bucket: s3Bucket,
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
      Bucket: s3Bucket,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public,
      CacheControl: `no-cache`,
    }
    return s3.putObject(params).promise()
  }

  buildFileLongUrl(key: string): string {
    return `${accessEndpoint}/${s3Bucket}/${key}`
  }

  getKeyFromLongUrl(longUrl: string): string {
    const key = longUrl.split('/').pop()
    if (!key) throw new Error('Invalid URL')
    return key
  }
}
