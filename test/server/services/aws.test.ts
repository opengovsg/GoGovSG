import { PutObjectAclCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { container } from '../../../src/server/util/inversify'
import {
  FileVisibility,
  S3Interface,
  S3ServerSide,
} from '../../../src/server/services/aws'
import { DependencyIds } from '../../../src/server/constants'

describe('S3ServerSide', () => {
  const fileURLPrefix = 'https://'
  const s3Bucket = 'file-staging.go.gov.sg'

  const MockS3 = jest.fn(() => ({
    send: jest.fn(),
  }))
  let mockS3Client = new MockS3()

  afterEach(() => {
    container.unbindAll()
  })
  beforeEach(() => {
    mockS3Client = new MockS3()
    container.bind(DependencyIds.fileURLPrefix).toConstantValue(fileURLPrefix)
    container.bind(DependencyIds.s3Bucket).toConstantValue(s3Bucket)
    container.bind(DependencyIds.s3Client).toConstantValue(mockS3Client)
    container.bind<S3Interface>(DependencyIds.s3).to(S3ServerSide)
  })

  it('should call s3Client.send with PutObjectAclCommand on setS3ObjectACL', () => {
    const key = 'key'
    const acl = FileVisibility.Private
    const s3 = container.get<S3Interface>(DependencyIds.s3)
    s3.setS3ObjectACL(key, acl)
    expect(mockS3Client.send).toHaveBeenCalledTimes(1)
    const command = mockS3Client.send.mock.calls[0][0]
    expect(command).toBeInstanceOf(PutObjectAclCommand)
    expect(command.input).toStrictEqual({
      Bucket: s3Bucket,
      Key: key,
      ACL: acl,
    })
  })

  it('should call s3Client.send with PutObjectCommand on uploadFileToS3', () => {
    const file = Buffer.from([])
    const key = 'key'
    const fileType = 'type'

    const s3 = container.get<S3Interface>(DependencyIds.s3)
    s3.uploadFileToS3(file, key, fileType)
    expect(mockS3Client.send).toHaveBeenCalledTimes(1)
    const command = mockS3Client.send.mock.calls[0][0]
    expect(command).toBeInstanceOf(PutObjectCommand)
    expect(command.input).toStrictEqual({
      ContentType: fileType,
      Bucket: s3Bucket,
      Body: file,
      Key: key,
      ACL: FileVisibility.Public,
      CacheControl: `no-cache`,
    })
  })

  it('should return correct file link when provided with a short url', () => {
    const shortUrl = 'test'
    const validLink = `${fileURLPrefix}${s3Bucket}/${shortUrl}`
    const s3 = container.get<S3Interface>(DependencyIds.s3)
    expect(s3.buildFileLongUrl(shortUrl)).toBe(validLink)
  })

  describe('getKeyFromLongUrl', () => {
    it('should return correct key when provided a long URL', () => {
      const shortUrl = 'test'
      const validLink = `${fileURLPrefix}${s3Bucket}/${shortUrl}`
      const s3 = container.get<S3Interface>(DependencyIds.s3)
      expect(s3.getKeyFromLongUrl(validLink)).toBe(shortUrl)
    })

    it('should throw when provided a long URL', () => {
      const validLink = `${fileURLPrefix}${s3Bucket}/`
      const s3 = container.get<S3Interface>(DependencyIds.s3)
      expect(() => s3.getKeyFromLongUrl(validLink)).toThrow('Invalid URL')
    })
  })
})
