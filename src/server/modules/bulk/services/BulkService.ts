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
        skipEmptyLines: true,
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

            if (
              acceptableLinkCount &&
              onlyOneColumn &&
              isNotBlacklisted &&
              isNotEmpty &&
              isValidUrl &&
              isNotCircularRedirect &&
              noParsingError
            ) {
              longUrls.push(stringData)
            } else {
              let errorMessage = `Row ${counter + 1}: `
              if (!acceptableLinkCount) {
                errorMessage += 'exceeds maximum number of links'
              } else if (!onlyOneColumn) {
                errorMessage += 'has more than one column'
              } else if (!isNotBlacklisted) {
                errorMessage += 'contains blacklisted link'
              } else if (!isNotEmpty) {
                errorMessage += 'is empty'
              } else if (!isValidUrl) {
                errorMessage += 'contains invalid url'
              } else if (isNotCircularRedirect) {
                errorMessage += 'contains circular redirect'
              } else if (!noParsingError) {
                errorMessage += 'has parsing error'
              }
              dogstatsd.increment(BULK_VALIDATION_ERROR, 1, 1, [
                `${BULK_VALIDATION_ERROR_TAGS.isValidUrl}`,
              ])
              throw new Error(errorMessage)
            }
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
          const shortUrl = await generateShortUrl(BULK_UPLOAD_RANDOM_STR_LENGTH)
          return { shortUrl, longUrl }
        }),
      )
    }
}

export default BulkService
