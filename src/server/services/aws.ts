import {
  ObjectCannedACL,
  PutObjectAclCommand,
  PutObjectAclCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'
import { inject, injectable } from 'inversify'
import { DependencyIds } from '../constants'

// Enums for S3 object ACL toggling. Do not change string representations.
export enum FileVisibility {
  Public = 'public-read',
  Private = 'private',
}

export interface S3Interface {
  setS3ObjectACL: (
    key: string,
    acl: FileVisibility,
  ) => Promise<PutObjectAclCommandOutput>
  uploadFileToS3: (
    file: Buffer,
    key: string,
    fileType: string,
  ) => Promise<PutObjectCommandOutput>
  buildFileLongUrl: (key: string) => string
  getKeyFromLongUrl: (longUrl: string) => string
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["setS3ObjectACL", "uploadFileToS3", "buildFileLongUrl", "getKeyFromLongUrl"] }] */
export class S3ServerSide implements S3Interface {
  private s3Client: S3Client

  private s3Bucket: string

  private fileURLPrefix: string

  constructor(
    @inject(DependencyIds.s3Client) s3Client: S3Client,
    @inject(DependencyIds.s3Bucket) s3Bucket: string,
    @inject(DependencyIds.fileURLPrefix) fileURLPrefix: string,
  ) {
    this.s3Client = s3Client
    this.s3Bucket = s3Bucket
    this.fileURLPrefix = fileURLPrefix
  }

  setS3ObjectACL(
    key: string,
    acl: FileVisibility,
  ): Promise<PutObjectAclCommandOutput> {
    const params = {
      Bucket: this.s3Bucket,
      Key: key,
      ACL: acl as ObjectCannedACL,
    }
    return this.s3Client.send(new PutObjectAclCommand(params))
  }

  uploadFileToS3(
    file: Buffer,
    key: string,
    fileType: string,
  ): Promise<PutObjectCommandOutput> {
    const params = {
      ContentType: fileType,
      Bucket: this.s3Bucket,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public as ObjectCannedACL,
      CacheControl: `no-cache`,
    }
    return this.s3Client.send(new PutObjectCommand(params))
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
