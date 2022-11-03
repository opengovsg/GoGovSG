import { StorableUrlSource } from '../../../repositories/enums'
import {
  BulkUrlMapping,
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import { GoUploadedFile, UpdateUrlOptions } from '..'

export interface UrlManagementService {
  bulkCreate: (
    userId: number,
    urlMappings: BulkUrlMapping[],
    tags?: string[],
  ) => Promise<void>
  createUrl: (
    userId: number,
    shortUrl: string,
    source: StorableUrlSource.Console | StorableUrlSource.Api,
    longUrl?: string,
    file?: GoUploadedFile,
    tags?: string[],
  ) => Promise<StorableUrl>
  updateUrl: (
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ) => Promise<StorableUrl>
  changeOwnership: (
    userId: number,
    shortUrl: string,
    newUserEmail: string,
  ) => Promise<StorableUrl>
  getUrlsWithConditions: (
    conditions: UserUrlsQueryConditions,
  ) => Promise<UrlsPaginated>
}

export default UrlManagementService
