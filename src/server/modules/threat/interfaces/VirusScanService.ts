import fileUpload from 'express-fileupload'

export interface VirusScanService {
  scanFile(
    file: fileUpload.UploadedFile,
  ): Promise<{ hasVirus: boolean; isPasswordProtected: boolean }>
}
