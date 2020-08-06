import fileUpload from 'express-fileupload'
import { injectable } from 'inversify'
import { ApiClient, ScanApi } from 'cloudmersive-virus-api-client'
import { VirusScanServiceInterface } from './interfaces/VirusScanServiceInterface'
import { UrlThreatScanServiceInterface } from './interfaces/UrlThreatScanServiceInterface'
import { cloudmersiveKey, logger } from '../config'

if (cloudmersiveKey) {
  const client = ApiClient.instance
  const ApiKey = client.authentications.Apikey
  ApiKey.apiKey = cloudmersiveKey
}
const api = new ScanApi()

@injectable()
export class CloudmersiveScanService
  implements VirusScanServiceInterface, UrlThreatScanServiceInterface {
  private static scanFilePromise: (file: Buffer) => Promise<boolean> = (file) =>
    new Promise((res, rej) => {
      api.scanFile(file, (err, data) => {
        if (err) {
          logger.error(`Error when scanning file via Cloudmersive: ${err}`)
          return rej(err)
        }
        return res(!data.CleanResult)
      })
    })

  private static scanUrlPromise: (url: string) => Promise<boolean> = (url) =>
    new Promise((res, rej) => {
      // @ts-ignore
      api.scanWebsite({ Url: url }, (err, data) => {
        if (err) {
          logger.error(`Error when scanning ${url} via Cloudmersive: ${err}`)
          logger.error(data)
          return rej(err)
        }
        return res(!data.CleanResult)
      })
    })

  public hasVirus: (file: fileUpload.UploadedFile) => Promise<boolean> = async (
    file,
  ) => {
    if (!cloudmersiveKey) {
      logger.warn(
        `No Cloudmersive API key provided. Not scanning file: ${file.name}`,
      )
      return false
    }
    return CloudmersiveScanService.scanFilePromise(file.data)
  }

  public isThreat: (url: string) => Promise<boolean> = async (url) => {
    if (!cloudmersiveKey) {
      logger.warn(`No Cloudmersive API key provided. Not scanning url: ${url}`)
      return false
    }
    return CloudmersiveScanService.scanUrlPromise(url)
  }
}

export default CloudmersiveScanService
