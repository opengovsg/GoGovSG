import {
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import { GoUploadedFile, UpdateUrlOptions } from '..'

export interface UrlManagementService {
  bulkCreate: (userId: number, tags?: string[]) => Promise<StorableUrl>
  createUrl: (
    userId: number,
    shortUrl: string,
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
