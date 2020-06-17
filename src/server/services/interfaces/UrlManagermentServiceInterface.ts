import { UpdateUrlOptions } from '../types'
import { GoUploadedFile } from '../../controllers/types'
import {
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../repositories/types'

export interface UrlManagementServiceInterface {
  createUrl(
    userId: number,
    shortUrl: string,
    longUrl?: string,
    file?: GoUploadedFile,
  ): Promise<StorableUrl>

  updateUrl(
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ): Promise<StorableUrl>

  changeOwnership(
    userId: number,
    shortUrl: string,
    newUserEmail: string,
  ): Promise<StorableUrl>

  getUrlsWithConditions(
    conditions: UserUrlsQueryConditions,
  ): Promise<UrlsPaginated>
}
