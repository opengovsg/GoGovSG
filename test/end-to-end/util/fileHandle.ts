import { dummyMaliciousFilePath } from './config'

const fs = require('fs')

/**
 * Create bulk creation csv
 * Overwrites file if exists, else create.
 */
export const createBulkCsv = (fileName: string, longUrls: string[]) => {
  return new Promise((resolve, reject) => {
    try {
      const headers = 'Original links to be shortened'
      const content = [headers, ...longUrls].join('\r\n')
      fs.writeFileSync(fileName, content)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Overwrite file if exists, else create a buffer of `size` printable bytes.
 * Avoid sparse NUL files: Cloudmersive `allowInvalidFiles: false` can reject them.
 */
export const createEmptyFileOfSize = (fileName: string, size: number) => {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(fileName, Buffer.alloc(Math.max(size, 0), 0x61))
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

export const createMaliciousFile = async () => {
  // false positive malicious content
  const eicarContent =
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'

  return new Promise((resolve, reject) => {
    try {
      const newFile = fs.openSync(dummyMaliciousFilePath, 'w')
      fs.writeSync(newFile, eicarContent)
      fs.closeSync(newFile)
      resolve(true)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}

/**
 * Delete file.
 */
export const deleteFile = (fileName: string) => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(fileName)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

export default createEmptyFileOfSize
