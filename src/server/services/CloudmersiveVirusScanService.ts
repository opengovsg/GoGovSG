import fileUpload from 'express-fileupload'
import { injectable } from 'inversify'
import { ApiClient, ScanApi } from 'cloudmersive-virus-api-client'
import { VirusScanServiceInterface } from './interfaces/VirusScanServiceInterface'
import { cloudmersiveKey, logger } from '../config'

if (cloudmersiveKey) {
  const client = ApiClient.instance
  const ApiKey = client.authentications.Apikey
  ApiKey.apiKey = cloudmersiveKey
}
const api = new ScanApi()

@injectable()
export class CloudmersiveVirusScanService implements VirusScanServiceInterface {
  scanFilePromise = (file: Buffer): Promise<boolean> => {
    return new Promise((res, rej) => {
      api.scanFile(file, (err, data) => {
        if (err) {
          logger.error(`Error when scanning file via Cloudmersive: ${err}`)
          return rej(err)
        }
        return res(!data.CleanResult)
      })
    })
  }

  public async hasVirus(file: fileUpload.UploadedFile): Promise<boolean> {
    if (!cloudmersiveKey) {
      logger.warn(
        `No Cloudmersive API key provided. Not scanning file: ${file.name}`,
      )
      return false
    }
    return this.scanFilePromise(file.data)
  }
}

export default CloudmersiveVirusScanService
