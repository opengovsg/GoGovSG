import FileType from 'file-type'
import { inject, injectable } from 'inversify'
import * as interfaces from '../interfaces'
import { DependencyIds } from '../../../constants'

export const DEFAULT_ALLOWED_FILE_EXTENSIONS = [
  'asc',
  'avi',
  'bmp',
  'csv',
  'dgn',
  'docx',
  'dwf',
  'dwg',
  'dxf',
  'ent',
  'gif',
  'jpeg',
  'jpg',
  'mpeg',
  'mpg',
  'mpp',
  'odb',
  'odf',
  'odg',
  'ods',
  'pdf',
  'png',
  'pptx',
  'rtf',
  'sxc',
  'sxd',
  'sxi',
  'sxw',
  'tif',
  'tiff',
  'txt',
  'wmv',
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

  hasAllowedType: (file: { name: string; data: Buffer }) => Promise<boolean> =
    async ({ name, data }) => {
      const fileType = await FileType.fromBuffer(data)
      const extension = fileType?.ext || `${`${name}`.split('.').pop()}`
      return this.allowedFileExtensions.includes(extension)
    }
}

export default FileTypeFilterService
