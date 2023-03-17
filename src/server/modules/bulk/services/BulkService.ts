import { injectable } from 'inversify'
import * as Papa from 'papaparse'
import { UploadedFile } from 'express-fileupload'
import * as interfaces from '../interfaces/BulkService'

import {
  bulkUploadMaxNum,
  bulkUploadRandomStrLength,
  ogHostname,
} from '../../../config'
import { BULK_UPLOAD_HEADER } from '../../../../shared/constants'
import { BulkUrlMapping } from '../../../repositories/types'
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
  parseCsv: (file: UploadedFile) => Promise<string[]> = async (file) => {
    const dataString = file.data?.toString()

    const longUrls: string[] = []

    if (!dataString) {
      throw new Error('csv file is empty')
    }

    let counter = 0

    return new Promise((resolve, reject) => {
      Papa.parse(dataString, {
        skipEmptyLines: false,
        delimiter: ',',
        complete: () => {
          // check for empty file
          if (longUrls.length === 0) {
            dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
              `${BULK_VALIDATION_ERROR_TAGS.hasUrls}`,
            ])
            reject(new Error('csv file is empty'))
          }
          resolve(longUrls)
        },
        error: (error: Error) => {
          reject(error)
        },
        step(step) {
          const rowData = step.data as string[]
          const stringData = rowData[0]

          if (counter === 0) {
            if (stringData !== BULK_UPLOAD_HEADER) {
              dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                `${BULK_VALIDATION_ERROR_TAGS.validHeader}`,
              ])
              throw new Error(
                `Row ${counter + 1}: bulk upload header is invalid`,
              )
            }
          } else {
            const acceptableLinkCount = counter <= BULK_UPLOAD_MAX_NUM // rows include header
            const onlyOneColumn = rowData.length === 1
            const isNotBlacklisted = !validators.isBlacklisted(stringData)
            const isNotEmpty = stringData.length > 0
            const isValidUrl = validators.isValidUrl(stringData)
            const isNotCircularRedirect = !validators.isCircularRedirects(
              stringData,
              ogHostname,
            )
            const noParsingError = step.errors.length === 0

            switch (true) {
              case !acceptableLinkCount:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.acceptableLinkCount}`,
                ])
                throw new Error(
                  `File exceeded ${BULK_UPLOAD_MAX_NUM} original URLs to shorten`,
                )
              case !onlyOneColumn:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.onlyOneColumn}`,
                ])
                throw new Error(
                  `Row ${
                    counter + 1
                  }: ${rowData} contains more than one column of data`,
                )
              case !isNotEmpty:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotEmpty}`,
                ])
                throw new Error(`Row ${counter + 1} is empty`)
              case !isValidUrl:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isValidUrl}`,
                ])
                throw new Error(
                  `Row ${counter + 1}: ${stringData} is not valid`,
                )
              case !isNotBlacklisted:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotBlacklisted}`,
                ])
                throw new Error(
                  `Row ${counter + 1}: ${stringData} is blacklisted`,
                )
              case !isNotCircularRedirect:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.isNotCircularRedirect}`,
                ])
                throw new Error(
                  `Row ${
                    counter + 1
                  }: ${stringData} redirects back to ${ogHostname}`,
                )
              case !noParsingError:
                dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                  `${BULK_VALIDATION_ERROR_TAGS.noParsingError}`,
                ])
                throw new Error('Parsing error')
              default:
              // no error, do nothing
            }
            longUrls.push(stringData)
          }
          counter += 1
        },
      })
    })
  }

  generateUrlMappings: (longUrls: string[]) => Promise<BulkUrlMapping[]> =
    async (longUrls) => {
      return Promise.all(
        longUrls.map(async (longUrl) => {
          return {
            longUrl,
            shortUrl: await generateShortUrl(BULK_UPLOAD_RANDOM_STR_LENGTH),
          }
        }),
      )
    }
}

export default BulkService
