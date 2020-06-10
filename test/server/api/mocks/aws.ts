import { AWSError, S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import {
  FileVisibility,
  S3Interface,
} from '../../../../src/server/services/aws'

export class S3InterfaceMock implements S3Interface {
  setS3ObjectACL: (
    key: string,
    acl: FileVisibility,
  ) => Promise<PromiseResult<S3.PutObjectAclOutput, AWSError>> = (__, _) =>
    Promise.reject()

  uploadFileToS3: (
    file: Buffer,
    key: string,
    fileType: string,
  ) => Promise<PromiseResult<S3.PutObjectOutput, AWSError>> = (__, _, ___) =>
    Promise.reject()

  buildFileLongUrl: (key: string) => string = (key) => key

  getKeyFromLongUrl: (longUrl: string) => string = (longUrl) => longUrl
}

export default S3InterfaceMock
