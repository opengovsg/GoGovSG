import fileUpload from 'express-fileupload'

export interface VirusScanServiceInterface {
  hasVirus(file: fileUpload.UploadedFile): Promise<boolean>
}
