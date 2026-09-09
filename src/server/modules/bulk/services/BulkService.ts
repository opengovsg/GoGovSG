import { inject, injectable } from 'inversify'
import * as Papa from 'papaparse'
import { UploadedFile } from 'express-fileupload'
import * as interfaces from '../interfaces/BulkService'

import {
  bulkUploadMaxNum,
  bulkUploadRandomStrLength,
  ogHostname,
} from '../../../config'
import {
  BULK_UPLOAD_HEADER,
  BULK_UPLOAD_SHORTURL_HEADER,
} from '../../../../shared/constants'
import { BulkUrlMapping } from '../../../repositories/types'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { DependencyIds } from '../../../constants'
import * as validators from '../../../../shared/util/validation'
import generateShortUrl from '../../../util/url'
import dogstatsd, {
  BULK_VALIDATION_ERROR,
  BULK_VALIDATION_ERROR_TAGS,
} from '../../../util/dogstatsd'

const BULK_UPLOAD_RANDOM_STR_LENGTH = bulkUploadRandomStrLength
const BULK_UPLOAD_MAX_NUM = bulkUploadMaxNum

@injectable()
export class BulkService implements interfaces.BulkService {
  private urlRepository: UrlRepositoryInterface

  public constructor(
    @inject(DependencyIds.urlRepository)
    urlRepository: UrlRepositoryInterface,
  ) {
    this.urlRepository = urlRepository
  }

  private validateShortUrlAvailability = async (
    rows: interfaces.BulkCsvRow[],
  ): Promise<void> => {
    for (let i = 0; i < rows.length; i += 1) {
      const { shortUrl } = rows[i]
      if (shortUrl) {
        // eslint-disable-next-line no-await-in-loop
        const isAvailable = await this.urlRepository.isShortUrlAvailable(
          shortUrl,
        )
        if (!isAvailable) {
          dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
            `${BULK_VALIDATION_ERROR_TAGS.isShortUrlAvailable}`,
          ])
          throw new Error(`Row ${i + 2}: ${shortUrl} is already taken`)
        }
      }
    }
  }

  parseCsv: (file: UploadedFile) => Promise<interfaces.BulkCsvRow[]> = async (
    file,
  ) => {
    const dataString = file.data?.toString()

    const rows: interfaces.BulkCsvRow[] = []
    const claimedShortUrls = new Set<string>()

    if (!dataString) {
      throw new Error('csv file is empty')
    }

    let counter = 0
    let hasShortUrlColumn = false

    return new Promise((resolve, reject) => {
      Papa.parse(dataString, {
        skipEmptyLines: 'greedy',
        delimiter: ',',
        complete: async () => {
          // check for empty file
          if (rows.length === 0) {
            dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
              `${BULK_VALIDATION_ERROR_TAGS.hasUrls}`,
            ])
            reject(new Error('csv file is empty'))
            return
          }
          try {
            await this.validateShortUrlAvailability(rows)
            resolve(rows)
          } catch (error) {
            reject(error)
          }
        },
        error: (error: Error) => {
          reject(error)
        },
        step: (step) => {
          const rowData = step.data as string[]

          if (counter === 0) {
            const firstHeader = rowData[0]?.trim()
            const secondHeader = rowData[1]?.trim()
            const isValidOneColumnHeader =
              rowData.length === 1 && firstHeader === BULK_UPLOAD_HEADER
            const isValidTwoColumnHeader =
              rowData.length === 2 &&
              firstHeader === BULK_UPLOAD_HEADER &&
              secondHeader === BULK_UPLOAD_SHORTURL_HEADER

            if (!isValidOneColumnHeader && !isValidTwoColumnHeader) {
              dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                `${BULK_VALIDATION_ERROR_TAGS.validHeader}`,
              ])
              throw new Error(
                `Row ${counter + 1}: bulk upload header is invalid`,
              )
            }
            hasShortUrlColumn = isValidTwoColumnHeader
          } else {
            const longUrl = rowData[0].trim()
            const shortUrl = hasShortUrlColumn
              ? rowData[1]?.trim() || undefined
              : undefined

            const acceptableLinkCount = counter <= BULK_UPLOAD_MAX_NUM // rows include header
            const acceptableColumnCount = hasShortUrlColumn
              ? rowData.length <= 2
              : rowData.length === 1
            const isNotBlacklisted = !validators.isBlacklisted(longUrl)
            const isEmpty = longUrl.length === 0
            const isValidUrl = validators.isValidUrl(longUrl)
            const isNotCircularRedirect = !validators.isCircularRedirects(
              longUrl,
              ogHostname,
            )
            const noParsingError = step.errors.length === 0
            const isValidShortUrl =
              !shortUrl || validators.isValidShortUrl(shortUrl)
            const isDuplicateShortUrl =
              !!shortUrl && claimedShortUrls.has(shortUrl)

            switch (true) {
              case !acceptableLinkCount:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.acceptableLinkCount}`,
                ])
                throw new Error(
                  `File exceeded ${BULK_UPLOAD_MAX_NUM} original URLs to shorten`,
                )
              case !acceptableColumnCount:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.onlyOneColumn}`,
                ])
                throw new Error(
                  `Row ${
                    counter + 1
                  }: ${rowData} contains more than one column of data`,
                )
              case isEmpty:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotEmpty}`,
                ])
                throw new Error(`Row ${counter + 1} is empty`)
              case !isValidUrl:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isValidUrl}`,
                ])
                throw new Error(`Row ${counter + 1}: ${longUrl} is not valid`)
              case !isNotBlacklisted:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotBlacklisted}`,
                ])
                throw new Error(`Row ${counter + 1}: ${longUrl} is blacklisted`)
              case !isNotCircularRedirect:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotCircularRedirect}`,
                ])
                throw new Error(
                  `Row ${
                    counter + 1
                  }: ${longUrl} redirects back to ${ogHostname}`,
                )
              case !isValidShortUrl:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isValidShortUrl}`,
                ])
                throw new Error(
                  `Row ${counter + 1}: ${shortUrl} is not a valid short link`,
                )
              case isDuplicateShortUrl:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isShortUrlAvailable}`,
                ])
                throw new Error(
                  `Row ${counter + 1}: ${shortUrl} is already taken`,
                )
              case !noParsingError:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.noParsingError}`,
                ])
                throw new Error('Parsing error')
              default:
              // no error, do nothing
            }
            if (shortUrl) {
              claimedShortUrls.add(shortUrl)
            }
            rows.push(shortUrl ? { longUrl, shortUrl } : { longUrl })
          }
          counter += 1
        },
      })
    })
  }

  generateUrlMappings: (
    rows: interfaces.BulkCsvRow[],
  ) => Promise<BulkUrlMapping[]> = async (rows) => {
    return Promise.all(
      rows.map(async ({ longUrl, shortUrl }) => {
        return {
          longUrl,
          shortUrl:
            shortUrl ?? (await generateShortUrl(BULK_UPLOAD_RANDOM_STR_LENGTH)),
        }
      }),
    )
  }
}

export default BulkService
