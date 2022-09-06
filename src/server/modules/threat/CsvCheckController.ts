import { Request, Response } from 'express'
import { injectable } from 'inversify'

import jsonMessage from '../../util/json'

@injectable()
export class CsvCheckController {
  public finalValidation: (req: Request, res: Response) => Promise<void> =
    async (req, res) => {
      const file = req.files?.file
      if (Array.isArray(file)) {
        res.unprocessableEntity(
          jsonMessage('Only single file uploads are supported.'),
        )
        return
      }
      if (file) {
        res.ok({
          filename: file.name,
        })
      } else {
        res.badRequest(jsonMessage(`Unable to detect file"`))
      }
    }
}

export default CsvCheckController
