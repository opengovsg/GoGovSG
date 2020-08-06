import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../util/json'
import { FileCheckControllerInterface } from './interfaces/FileCheckControllerInterface'
import { DependencyIds } from '../constants'
import { FileTypeFilterServiceInterface } from '../services/interfaces/FileTypeFilterServiceInterface'
import { VirusScanServiceInterface } from '../services/interfaces/VirusScanServiceInterface'
import { logger } from '../config'
import { UserType } from '../models/user'

@injectable()
export class FileCheckController implements FileCheckControllerInterface {
  private fileTypeFilterService: FileTypeFilterServiceInterface

  private virusScanService: VirusScanServiceInterface

  public constructor(
    @inject(DependencyIds.fileTypeFilterService)
    fileTypeFilterService: FileTypeFilterServiceInterface,
    @inject(DependencyIds.virusScanService)
    virusScanService: VirusScanServiceInterface,
  ) {
    this.fileTypeFilterService = fileTypeFilterService
    this.virusScanService = virusScanService
  }

  public checkFile: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const file = req.files?.file

    if (Array.isArray(file)) {
      res.unprocessableEntity(
        jsonMessage('Only single file uploads are supported.'),
      )
      return
    }

    if (file) {
      if (!(await this.fileTypeFilterService.hasAllowedType(file))) {
        res.unsupportedMediaType(jsonMessage('File type disallowed.'))
        return
      }

      try {
        const hasVirus = await this.virusScanService.hasVirus(file)
        if (hasVirus) {
          const user = req.session?.user as UserType
          logger.warn(
            `Malicious link attempt: User ${user?.id} tried to upload ${file.name}`,
          )
          res.badRequest(jsonMessage('File is likely to be malicious.'))
          return
        }
      } catch (error) {
        logger.error(error)
        res.serverError(jsonMessage(error.message))
        return
      }
    }

    next()
  }
}

export default FileCheckController
