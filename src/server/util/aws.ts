import { AWSError, S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable, inject } from 'inversify'
import DependencyIds from '../constants'

// Enums for S3 object ACL toggling. Do not change string representations.
export enum FileVisibility {
  Public = 'public-read',
  Private = 'private',
}

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
  private s3Client: S3
  private s3Bucket: string
  private fileURLPrefix: string

  constructor(
    @inject(DependencyIds.s3Client) s3Client: S3,
    @inject(DependencyIds.s3Bucket) s3Bucket: string,
    @inject(DependencyIds.fileURLPrefix) fileURLPrefix: string
  ) {
    this.s3Client = s3Client
    this.s3Bucket = s3Bucket
    this.fileURLPrefix = fileURLPrefix
  }

  setS3ObjectACL(
    key: string,
    acl: FileVisibility,
  ): Promise<PromiseResult<S3.PutObjectAclOutput, AWSError>> {
    const params = {
      Bucket: this.s3Bucket,
      Key: key,
      ACL: acl,
    }
    const result = this.s3Client.putObjectAcl(params).promise()
    return result
  }

  uploadFileToS3(
    file: Buffer,
    key: string,
    fileType: string,
  ): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
    const params = {
      ContentType: fileType,
      Bucket: this.s3Bucket,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public,
      CacheControl: `no-cache`,
    }
    return this.s3Client.putObject(params).promise()
  }

  buildFileLongUrl(key: string): string {
    return `${this.fileURLPrefix}${this.s3Bucket}/${key}`
  }

  getKeyFromLongUrl(longUrl: string): string {
    const key = longUrl.split('/').pop()

    if (!key) {
      throw new Error('Invalid URL')
    }

    return key
  }
}
