import { S3 } from 'aws-sdk'
import { injectable } from 'inversify'
import { parse } from 'url'
import { s3Bucket } from '../config'

// Enums for S3 object ACL toggling. Do not change string representations.
export enum FileVisibility {
  Public = 'public-read',
  Private = 'private',
}

export const s3 = new S3()

export interface S3Interface {
  setS3ObjectACL: (key: string, acl: FileVisibility) => Promise<any>
  uploadFileToS3: (file: Buffer, key: string, fileType: string) => Promise<any>
  isValidS3Shortlink: (url: string, shortUrl: string) => boolean
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["setS3ObjectACL", "uploadFileToS3", "isValidS3Shortlink"] }] */
export class S3ServerSide implements S3Interface {
  setS3ObjectACL(key: string, acl: FileVisibility): Promise<any> {
    const params = {
      Bucket: s3Bucket,
      Key: key,
      ACL: acl,
    }
    return s3.putObjectAcl(params).promise()
  }

  uploadFileToS3(file: Buffer, key: string, fileType: string): Promise<any> {
    const params = {
      ContentType: fileType,
      Bucket: s3Bucket,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public,
    }
    return s3.putObject(params).promise()
  }

  isValidS3Shortlink(url: string, shortUrl: string): boolean {
    const parsedUrl = parse(url)
    const { protocol, host, path } = parsedUrl
    return protocol === 'https:' && host === s3Bucket && path === `/${shortUrl}`
  }
}
