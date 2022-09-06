export interface FileTypeFilterService {
  hasAllowedType: (
    file: {
      name: string
      data: Buffer
    },
    inputExtension?: string,
  ) => Promise<boolean>
}

export default FileTypeFilterService
