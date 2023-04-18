export interface FileTypeFilterService {
  getExtension: (file: {
    name: string
    data: Buffer
  }) => Promise<string | undefined>

  hasAllowedType: (
    file: {
      name: string
      data: Buffer
    },
    allowedExtensions?: string[],
  ) => Promise<boolean>
}

export default FileTypeFilterService
