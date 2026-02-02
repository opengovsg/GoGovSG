export interface FileTypeFilterService {
  getExtensionAndMimeType: (file: {
    name: string
    data: Buffer
  }) => Promise<FileTypeData>

  hasAllowedExtensionType: (
    extension: string,
    allowedExtensions?: string[],
  ) => Promise<boolean>
}

export interface FileTypeData {
  extension: string
  mimeType: string
}

export default FileTypeFilterService
