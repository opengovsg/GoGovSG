import FileType from 'file-type'
import { inject, injectable } from 'inversify'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'

export const DEFAULT_ALLOWED_FILE_EXTENSIONS = [
  'avi',
  'bmp',
  'csv',
  'docx',
  'dwf',
  'dwg',
  'dxf',
  'gif',
  'jpeg',
  'jpg',
  'mpeg',
  'mpg',
  'ods',
  'pdf',
  'png',
  'pptx',
  'rtf',
  'tif',
  'tiff',
  'txt',
  'xlsx',
]

@injectable()
export class FileTypeFilterService implements interfaces.FileTypeFilterService {
  allowedFileExtensions: string[]

  constructor(
    @inject(DependencyIds.allowedFileExtensions)
    allowedFileExtensions: string[],
  ) {
    this.allowedFileExtensions = allowedFileExtensions
  }

  hasAllowedType: (
    file: {
      name: string
      data: Buffer
    },
    allowedExtensions?: string[],
  ) => Promise<boolean> = async ({ name, data }, allowedExtensions) => {
    const fileType = await FileType.fromBuffer(data)
    const extension = fileType?.ext || name.split('.').pop()
    if (!extension) return false

    if (allowedExtensions && allowedExtensions.length > 0) {
      return allowedExtensions.includes(extension)
    }
    return this.allowedFileExtensions.includes(extension)
  }
}

export default FileTypeFilterService
