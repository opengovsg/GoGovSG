import { bool } from 'aws-sdk/clients/signer'
import { Request, Response } from 'express'
import { injectable } from 'inversify'
import paparse from 'papaparse'
import { ogHostname } from '../../config'
import { BULK_UPLOAD_HEADER, BULK_UPLOAD_LIMIT } from '../../constants'

import * as validators from '../../../shared/util/validation'

import jsonMessage from '../../util/json'

type CSVSchema = {
  rows: number
  isValid: bool
}

@injectable()
export class BulkController {
  private parseCSV = (dataString: string): CSVSchema => {
    const schema = {
      rows: 0,
      isValid: true,
    } as CSVSchema

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
          const acceptableLinkCount = schema.rows <= BULK_UPLOAD_LIMIT
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

  public csvValidation: (req: Request, res: Response) => Promise<void> = async (
    req,
    res,
  ) => {
    const file = req.files?.file
    if (Array.isArray(file)) {
      res.unprocessableEntity(
        jsonMessage('Only single file uploads are supported.'),
      )
      return
    }
    if (!file) {
      res.badRequest(jsonMessage(`Unable to detect file"`))
      return
    }

    const schema = this.parseCSV(file.data.toString())
    if (schema.isValid) {
      res.ok({ isValid: schema.isValid })
    } else {
      res.badRequest({ isValid: schema.isValid })
    }
  }
}

export default BulkController
