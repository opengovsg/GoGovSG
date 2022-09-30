import { injectable } from 'inversify'
import paparse from 'papaparse'
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

const BULK_UPLOAD_RANDOM_STR_LENGTH = bulkUploadRandomStrLength
const BULK_UPLOAD_MAX_NUM = bulkUploadMaxNum

@injectable()
export class BulkService implements interfaces.BulkService {
  parseCsv: (file: UploadedFile) => interfaces.CSVSchema = (file) => {
    const dataString = file.data?.toString()

    const schema = {
      rows: 0,
      isValid: true,
      longUrls: [],
    } as interfaces.CSVSchema

    if (!dataString) {
      schema.isValid = false
      return schema
    }

    paparse.parse(dataString, {
      skipEmptyLines: false,
      delimiter: ',',
      step(step, parser) {
        const rowData = step.data as string[]
        const stringData = rowData[0]
        let validRow = true
        if (schema.rows === 0) {
          // if header is invalid
          if (stringData !== BULK_UPLOAD_HEADER) {
            schema.isValid = false
            parser.abort()
            return
          }
        } else {
          const acceptableLinkCount = schema.rows <= BULK_UPLOAD_MAX_NUM // rows include header
          const onlyOneColumn = rowData.length === 1
          const isNotBlacklisted = !validators.isBlacklisted(stringData)
          const isNotEmpty = stringData.length > 0
          const isHttps = validators.isHttps(stringData)
          const validCharacters = validators.isPrintableAscii(stringData)
          const isNotCircularRedirect = !validators.isCircularRedirects(
            stringData,
            ogHostname,
          )
          const noParsingError = step.errors.length === 0
          validRow =
            isNotCircularRedirect &&
            acceptableLinkCount &&
            onlyOneColumn &&
            isNotBlacklisted &&
            isNotEmpty &&
            isHttps &&
            validCharacters &&
            noParsingError

          if (!validRow) {
            schema.isValid = false
            parser.abort()
            return
          }
          schema.longUrls.push(stringData)
        }
        schema.rows += 1
      },
    })
    return schema
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
