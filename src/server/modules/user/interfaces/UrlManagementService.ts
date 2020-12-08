import {
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import { GoUploadedFile, UpdateUrlOptions } from '..'

export interface UrlManagementService {
  createUrl: (
    userId: number,
    shortUrl: string,
    longUrl?: string,
    file?: GoUploadedFile,
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
