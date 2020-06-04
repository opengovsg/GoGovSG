import { AWSError, S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable } from 'inversify'
import { s3Bucket } from '../config'

// Enums for S3 object ACL toggling. Do not change string representations.
export enum FileVisibility {
  Public = 'public-read',
  Private = 'private',
}

export const s3 = new S3()

export interface S3Interface {
  setS3ObjectACL: (
    key: string,
    acl: FileVisibility,
  ) => Promise<PromiseResult<S3.PutObjectAclOutput, AWSError>>
  uploadFileToS3: (
    file: Buffer,
    key: string,
    fileType: string,
  ) => Promise<PromiseResult<S3.PutObjectOutput, AWSError>>
  buildFileLongUrl: (key: string) => string
  getKeyFromLongUrl: (longUrl: string) => string
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["setS3ObjectACL", "uploadFileToS3", "buildFileLongUrl", "getKeyFromLongUrl"] }] */
export class S3ServerSide implements S3Interface {
  setS3ObjectACL(
    key: string,
    acl: FileVisibility,
  ): Promise<PromiseResult<S3.PutObjectAclOutput, AWSError>> {
    const params = {
      Bucket: s3Bucket,
      Key: key,
      ACL: acl,
    }
    const result = s3.putObjectAcl(params).promise()
    return result
  }

  uploadFileToS3(
    file: Buffer,
    key: string,
    fileType: string,
  ): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
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
    return `https://${s3Bucket}/${key}`
  }

  getKeyFromLongUrl(longUrl: string): string {
    const key = longUrl.split('/').pop()

    if (!key) {
      throw new Error('Invalid URL')
    }

    return key
  }
}
