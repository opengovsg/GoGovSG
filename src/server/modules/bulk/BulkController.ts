import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import * as interfaces from './interfaces'

@injectable()
export class BulkController {
  bulkService: interfaces.BulkService

  public constructor(
    @inject(DependencyIds.bulkService)
    bulkService: interfaces.BulkService,
  ) {
    this.bulkService = bulkService
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

    const schema = this.bulkService.parseCsv(file.data.toString())
    if (schema.isValid) {
      // res.ok({ isValid: schema.isValid })
      // TODO: process CSV
    } else {
      res.badRequest({ isValid: schema.isValid })
    }
  }
}

export default BulkController
