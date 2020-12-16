import fileUpload from 'express-fileupload'

export interface FileTypeFilterService {
  hasAllowedType(file: fileUpload.UploadedFile): Promise<boolean>
}

export default FileTypeFilterService
