import fileUpload from 'express-fileupload'

export interface FileTypeFilterServiceInterface {
  hasAllowedType(file: fileUpload.UploadedFile): Promise<boolean>
}
