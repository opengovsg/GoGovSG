export interface FileTypeFilterService {
  hasAllowedType: (
    file: {
      name: string
      data: Buffer
    },
    inputExtensions?: string[],
  ) => Promise<boolean>
}

export default FileTypeFilterService
