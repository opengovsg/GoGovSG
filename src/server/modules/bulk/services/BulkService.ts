import { injectable } from 'inversify'
import paparse from 'papaparse'
import * as interfaces from '../interfaces/BulkService'

import { ogHostname } from '../../../config'
import { BULK_UPLOAD_HEADER, BULK_UPLOAD_MAX } from '../../../constants'

import * as validators from '../../../../shared/util/validation'

@injectable()
export class BulkService implements interfaces.BulkService {
  parseCsv: (dataString: string) => interfaces.CSVSchema = (dataString) => {
    const schema = {
      rows: 0,
      isValid: true,
    } as interfaces.CSVSchema

    paparse.parse(dataString, {
      skipEmptyLines: false,
      delimiter: ',',
      step(step, parser) {
        schema.rows += 1
        const rowData = step.data as string[]
        let validRow = true
        if (schema.rows === 1) {
          validRow = schema.rows === 1 && rowData[0] === BULK_UPLOAD_HEADER
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
        }

        if (!validRow) {
          schema.isValid = false
          parser.abort()
        }
      },
    })
    return schema
  }
}

export default BulkService
