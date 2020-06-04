export function getFileExtension(fileName: string): string {
  if (!fileName.includes('.')) {
    return ''
  }
  const extension = fileName.split('.').pop()
  if (!extension) {
    throw new Error('Invalid file name')
  }

  return extension
}

export function addFileExtension(fileName: string, extension: string): string {
  if (!extension) {
    return fileName
  }

  return `${fileName}.${extension}`
}

export default getFileExtension
