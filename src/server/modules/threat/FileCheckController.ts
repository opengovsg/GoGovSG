import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import fileUpload from 'express-fileupload'
import dogstatsd, {
  MALICIOUS_ACTIVITY_FILE,
  SCAN_FAILED_FILE,
} from '../../util/dogstatsd'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { FileTypeFilterService, VirusScanService } from './interfaces'
import { logger } from '../../config'

@injectable()
export class FileCheckController {
  private fileTypeFilterService: FileTypeFilterService

  private virusScanService: VirusScanService

  public constructor(
    @inject(DependencyIds.fileTypeFilterService)
    fileTypeFilterService: FileTypeFilterService,
    @inject(DependencyIds.virusScanService)
    virusScanService: VirusScanService,
  ) {
    this.fileTypeFilterService = fileTypeFilterService
    this.virusScanService = virusScanService
  }

  public singleFileCheck: (
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
    next()
  }

  public fileExtensionAndMimeTypeCheck =
    (allowedExtensions?: string[]) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const file = req.files?.file as fileUpload.UploadedFile | undefined

      if (file) {
        const fileTypeData =
          await this.fileTypeFilterService.getExtensionAndMimeType(file)
        if (
          fileTypeData.extension === '' ||
          !(await this.fileTypeFilterService.hasAllowedType(
            fileTypeData.extension,
            allowedExtensions,
          ))
        ) {
          res.unsupportedMediaType(jsonMessage('File type disallowed.'))
          return
        }

        file.mimetype = fileTypeData.mimeType
      }

      next()
    }

  public fileVirusCheck: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> = async (req, res, next) => {
    const file = req.files?.file as fileUpload.UploadedFile | undefined
    const user = req.session?.user
    if (file) {
      try {
        const { hasVirus, isPasswordProtected } =
          await this.virusScanService.scanFile(file)
        if (isPasswordProtected) {
          // Do not support password-protected files as they cannot be scanned for viruses
          logger.info(
            `User ${
              user?.email || user?.id
            } tried to upload a password-protected file ${file.name}`,
          )
          res.badRequest(jsonMessage('Cannot upload password-protected files.'))
          return
        }
        if (hasVirus) {
          logger.warn(
            `Malicious file attempt: User ${
              user?.email || user?.id
            } tried to upload ${file.name}`,
          )
          dogstatsd.increment(MALICIOUS_ACTIVITY_FILE, 1, 1)
          res.badRequest(jsonMessage('File is likely to be malicious.'))
          return
        }
      } catch (error) {
        dogstatsd.increment(SCAN_FAILED_FILE, 1, 1)
        logger.error('Unable to scan file: ', error)
        res.badRequest(
          jsonMessage(
            'Your file could not be scanned at this moment, please try again. If the error persists, please contact us.',
          ),
        )
        return
      }
    }
    next()
  }
}

export default FileCheckController
