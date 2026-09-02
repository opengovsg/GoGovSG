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
    source: StorableUrlSource.Console | StorableUrlSource.Api,
    shortUrl?: string,
    longUrl?: string,
    file?: GoUploadedFile,
    tags?: string[],
    description?: string,
    contactEmail?: string | null,
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

  /**
   * Deactivates a shortUrl to prevent it from being usable by others, due to
   * it being detected as malicious.
   * @param shortUrl The shortUrl to deactivate.
   * @returns {Promise<void>} A promise that resolves when the shortUrl is deactivated.
   * @throws {NotFoundError} If the shortUrl does not exist.
   */
  deactivateMaliciousShortUrl: (shortUrl: string) => Promise<void>
}

export default UrlManagementService
