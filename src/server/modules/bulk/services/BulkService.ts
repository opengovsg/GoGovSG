import { injectable } from 'inversify'
import paparse from 'papaparse'
import * as interfaces from '../interfaces/BulkService'

import { ogHostname } from '../../../config'
import { BULK_UPLOAD_HEADER, BULK_UPLOAD_MAX } from '../../../constants'
import { BulkUrlMapping } from '../../../repositories/types'
import * as validators from '../../../../shared/util/validation'
import generateShortUrl from '../../../util/url'

@injectable()
export class BulkService implements interfaces.BulkService {
  parseCsv: (dataString: string) => interfaces.CSVSchema = (dataString) => {
    const schema = {
      rows: 0,
      isValid: true,
      longUrls: [],
    } as interfaces.CSVSchema

    paparse.parse(dataString, {
      skipEmptyLines: false,
      delimiter: ',',
      step(step, parser) {
        const rowData = step.data as string[]
        let validRow = true
        if (schema.rows === 0) {
          // if header is invalid
          if (rowData[0] !== BULK_UPLOAD_HEADER) {
            schema.isValid = false
            parser.abort()
          }
        } else {
          const acceptableLinkCount = schema.rows <= BULK_UPLOAD_MAX + 1 // rows include header
          const onlyOneColumn = rowData.length === 1
          const isNotBlacklisted = !validators.isBlacklisted(rowData[0])
          const isNotEmpty = rowData[0].length > 0
          const isHttps = validators.isHttps(rowData[0])
          const validCharacters = validators.isPrintableAscii(rowData[0])
          const isNotCircularRedirect = !validators.isCircularRedirects(
            rowData[0],
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
          }
          schema.longUrls.push(rowData[0])
        }
        schema.rows += 1
      },
    })
    return schema
  }

  generateUrlMappings: (
    longUrls: string[],
    length?: number,
  ) => Promise<BulkUrlMapping[]> = async (longUrls, length = 8) => {
    return Promise.all(
      longUrls.map(async (longUrl) => {
        return {
          longUrl,
          shortUrl: await generateShortUrl(length),
        }
      }),
    )
  }
}

export default BulkService
