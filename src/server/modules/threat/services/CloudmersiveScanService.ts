import { inject, injectable } from 'inversify'
import { ScanApi } from 'cloudmersive-virus-api-client'
import { VirusScanService } from '../interfaces'
import { logger } from '../../../config'
import { DependencyIds } from '../../../constants'

@injectable()
export class CloudmersiveScanService implements VirusScanService {
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

  private scanFilePromise: (
    file: Buffer,
  ) => Promise<{ hasVirus: boolean; isPasswordProtected: boolean }> = (file) =>
    new Promise((res, rej) => {
      const options = {
        allowExecutables: false, // default value
        allowInvalidFiles: false, // default value
        allowScripts: false, // default value
        restrictFileTypes: '', // default value, disabled
      }
      this.api.scanFileAdvanced(file, options, (err, data) => {
        if (err) {
          logger.error(`Error when scanning file via Cloudmersive: ${err}`)
          return rej(err)
        }
        return res({
          // @types/cloudmersive-virus-api-client is outdated so `data` doesn't have the `ContainsPasswordProtectedFile` property
          isPasswordProtected: (data as any).ContainsPasswordProtectedFile,
          hasVirus: data.FoundViruses !== null,
        })
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

  public scanFile: (file: {
    data: Buffer
    name: string
  }) => Promise<{ hasVirus: boolean; isPasswordProtected: boolean }> = async (
    file,
  ) => {
    if (!this.cloudmersiveKey) {
      logger.warn(
        `No Cloudmersive API key provided. Not scanning file: ${file.name}`,
      )
      return { hasVirus: false, isPasswordProtected: false }
    }
    return this.scanFilePromise(file.data)
  }

  // Note: This function is no longer used as we now use Google Safe Browsing
  // to scan URLs instead. We can consider removing this functionality.
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
