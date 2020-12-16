import fileUpload from 'express-fileupload'

export interface VirusScanService {
  hasVirus(file: fileUpload.UploadedFile): Promise<boolean>
}
