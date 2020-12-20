const fs = require('fs')

/**
 * Overwrite file if exists, else create.
 */
export const createEmptyFileOfSize = (fileName: string, size: number) => {
  return new Promise((resolve, reject) => {
    try {
      const newFile = fs.openSync(fileName, 'w')
      if (size > 0) {
        // Write one byte (with code 0) at the desired offset
        // This forces the expanding of the file and fills the gap
        // with characters with code 0
        fs.writeSync(newFile, Buffer.alloc(1), 0, 1, size - 1)
      }
      fs.closeSync(newFile)
      resolve(true)
    } catch (error) {
      reject(error)
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
