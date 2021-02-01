import { inject, injectable } from 'inversify'
import { ScanApi } from 'cloudmersive-virus-api-client'
import { logger } from '../../../config'
import { DependencyIds } from '../../../constants'

@injectable()
export class CloudmersiveScanService {
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
}

export default CloudmersiveScanService
