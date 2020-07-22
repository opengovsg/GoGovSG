import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../util/json'
import { FileCheckControllerInterface } from './interfaces/FileCheckControllerInterface'
import { DependencyIds } from '../constants'
import { VirusScanServiceInterface } from '../services/interfaces/VirusScanServiceInterface'

@injectable()
export class FileCheckController implements FileCheckControllerInterface {
  private virusScanService: VirusScanServiceInterface

  public constructor(
    @inject(DependencyIds.virusScanService)
    virusScanService: VirusScanServiceInterface,
  ) {
    this.virusScanService = virusScanService
  }

  public checkFile: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const file = req.files?.file

    if (Array.isArray(file)) {
      res.badRequest(jsonMessage('Only single file uploads are supported.'))
      return
    }

    if (file) {
      try {
        const hasVirus = await this.virusScanService.hasVirus(file)
        if (hasVirus) {
          res.badRequest(jsonMessage('File is likely to be malicious.'))
          return
        }
      } catch (error) {
        res.serverError(jsonMessage(error.message))
        return
      }
    }

    next()
  }
}

export default FileCheckController
