import { inject, injectable } from 'inversify'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'
import { FileTypeData } from '../interfaces/FileTypeFilterService'

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
  'zip',
]

export const FILE_EXTENSION_MIME_TYPE_MAP = new Map<string, string>([
  ['csv', 'text/csv'],
  ['dwf', 'application/x-dwf'],
  ['dxf', 'application/dxf'],
])

@injectable()
export class FileTypeFilterService implements interfaces.FileTypeFilterService {
  allowedFileExtensions: string[]

  fileExtensionsMimeTypeMap: Map<string, string>

  constructor(
    @inject(DependencyIds.allowedFileExtensions)
    allowedFileExtensions: string[],
    @inject(DependencyIds.fileExtensionsMimeTypeMap)
    fileExtensionsMimeTypeMap: Map<string, string>,
  ) {
    this.allowedFileExtensions = allowedFileExtensions
    this.fileExtensionsMimeTypeMap = fileExtensionsMimeTypeMap
  }

  getExtensionAndMimeType: (file: {
    name: string
    data: Buffer
  }) => Promise<FileTypeData> = async ({ name, data }) => {
    // file-type is pure ESM; dynamic import is the interop path from this
    // CommonJS-compiled codebase.
    const { fileTypeFromBuffer } = await import('file-type')
    const fileType = await fileTypeFromBuffer(data)
    let ext: string | undefined = fileType?.ext
    let mimeType: string | undefined = fileType?.mime
    if (!ext || !mimeType) {
      ext = name.split('.').pop()
      mimeType = this.fileExtensionsMimeTypeMap.get(ext ?? '')
    }
    return {
      extension: ext ?? '',
      mimeType: mimeType ?? 'text/plain',
    }
  }

  hasAllowedExtensionType: (
    extension: string,
    allowedExtensions?: string[],
  ) => Promise<boolean> = async (extension, allowedExtensions) => {
    if (allowedExtensions && allowedExtensions.length > 0) {
      return allowedExtensions.includes(extension)
    }
    return this.allowedFileExtensions.includes(extension)
  }
}

export default FileTypeFilterService
