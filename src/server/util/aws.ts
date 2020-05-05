import { URL, parse } from 'url'
import { S3 } from 'aws-sdk'
import { logger, s3Bucket } from '../config'

// Types for S3 object ACL toggling. Do not change string representations.
export const PUBLIC = 'public-read'
export const PRIVATE = 'private'
type VisibilityType = 'public-read' | 'private'

export const s3 = new S3()

/**
 * Reformat the pre-signed url to one that will be accepted by S3.
 *
 * This is necessary because we used a gov.sg CNAME and configured S3
 * to only accept requests that have that gov.sg CNAME as the path.
 *
 * Broadly speaking, we need to change https://s3.amazonaws.com/file.go.gov.sg/link?search
 * to https://file.go.gov.sg.s3.amazonaws.com/link?search.
 */
const reformatPresignedUrl = (url: string, fileName: string) => {
  const urlObj = parse(url)
  const {
    host,
    pathname,
    protocol,
    search,
  } = urlObj
  const newUrl = new URL('https://lorem-ipsum.com')
  newUrl.protocol = protocol as string
  newUrl.host = `${pathname?.split('/')[1]}.${host}`
  newUrl.pathname = fileName
  newUrl.search = search as string
  return newUrl.href
}

export const generatePresignedUrl = async (fileName: string, fileType: string) => {
  const params = {
    Bucket: s3Bucket,
    Key: fileName,
    ContentType: fileType,
    Expires: 60, // 60 seconds.
  }
  const presignedUrl = await s3.getSignedUrlPromise('putObject', params)
  return reformatPresignedUrl(presignedUrl, fileName)
}

export const setS3ObjectACL = (key: string, acl: VisibilityType): Promise<void> => {
  const params = {
    Bucket: s3Bucket,
    Key: key,
    ACL: acl,
  }
  return new Promise((res, rej) => {
    s3.putObjectAcl(params, (err) => {
      if (err) {
        logger.error(err)
        rej(err)
      }
      res()
    })
  })
}
