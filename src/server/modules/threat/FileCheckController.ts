import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { CloudmersiveScanService, FileTypeFilterService } from './services'
import { logger } from '../../config'
import { UserType } from '../../models/user'

@injectable()
export class FileCheckController {
  private fileTypeFilterService: Pick<
    FileTypeFilterService,
    keyof FileTypeFilterService
  >

  private virusScanService: Pick<
    CloudmersiveScanService,
    keyof CloudmersiveScanService
  >

  public constructor(
    @inject(DependencyIds.fileTypeFilterService)
    fileTypeFilterService: Pick<
      FileTypeFilterService,
      keyof FileTypeFilterService
    >,
    @inject(DependencyIds.virusScanService)
    virusScanService: Pick<
      CloudmersiveScanService,
      keyof CloudmersiveScanService
    >,
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
            `Malicious file attempt: User ${user?.id} tried to upload ${file.name}`,
          )
          res.badRequest(jsonMessage('File is likely to be malicious.'))
          return
        }
      } catch (error) {
        logger.error('Unable to scan file: ', error)
        res.badRequest(
          jsonMessage('Your file could not be scanned by antivirus software.'),
        )
        return
      }
    }

    next()
  }
}

export default FileCheckController
