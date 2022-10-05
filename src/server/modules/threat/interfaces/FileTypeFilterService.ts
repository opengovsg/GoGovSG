export interface FileTypeFilterService {
  hasAllowedType: (
    file: {
      name: string
      data: Buffer
    },
    allowedExtensions?: string[],
  ) => Promise<boolean>
}

export default FileTypeFilterService
