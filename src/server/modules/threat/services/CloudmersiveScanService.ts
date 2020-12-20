import { inject, injectable } from 'inversify'
import { ScanApi } from 'cloudmersive-virus-api-client'
import { UrlThreatScanService, VirusScanService } from '../interfaces'
import { logger } from '../../../config'
import { DependencyIds } from '../../../constants'

@injectable()
export class CloudmersiveScanService
  implements VirusScanService, UrlThreatScanService {
  private cloudmersiveKey: string

  private api: ScanApi

  constructor(
    @inject(DependencyIds.cloudmersiveKey)
    cloudmersiveKey: string,
    @inject(DependencyIds.cloudmersiveClient)
    api: ScanApi,
  ) {
    this.cloudmersiveKey = cloudmersiveKey
    this.api = api
  }

  private scanFilePromise: (file: Buffer) => Promise<boolean> = (file) =>
    new Promise((res, rej) => {
      this.api.scanFile(file, (err, data) => {
        if (err) {
          logger.error(`Error when scanning file via Cloudmersive: ${err}`)
          return rej(err)
        }
        return res(!data.CleanResult)
      })
    })

  private scanUrlPromise: (url: string) => Promise<boolean> = (url) =>
    new Promise((res, rej) => {
      this.api.scanWebsite({ Url: url }, (err, data) => {
        if (err) {
          logger.error(`Error when scanning ${url} via Cloudmersive: ${err}`)
          logger.error(data)
          return rej(err)
        }
        return res(!data.CleanResult)
      })
    })

  public hasVirus: (file: {
    data: Buffer
    name: string
  }) => Promise<boolean> = async (file) => {
    if (!this.cloudmersiveKey) {
      logger.warn(
        `No Cloudmersive API key provided. Not scanning file: ${file.name}`,
      )
      return false
    }
    return this.scanFilePromise(file.data)
  }

  public isThreat: (url: string) => Promise<boolean> = async (url) => {
    if (!this.cloudmersiveKey) {
      logger.warn(`No Cloudmersive API key provided. Not scanning url: ${url}`)
      return false
    }
    const isThreat = await this.scanUrlPromise(url)
    if (isThreat) {
      logger.info(`Considered threat by Cloudmersive but ignoring: ${url}`)
    }
    return false
  }
}

export default CloudmersiveScanService
