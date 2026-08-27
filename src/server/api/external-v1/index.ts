import Express from 'express'
import fileUpload from 'express-fileupload'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiV1Controller } from '../../modules/api/external-v1'
import { FileCheckController, UrlCheckController } from '../../modules/threat'
import { MAX_FILE_UPLOAD_SIZE } from '../../../shared/constants'
import {
  urlEditSchema,
  urlRetrievalSchema,
  urlSchema,
  userUrlsQueryConditions,
} from './validators'

const apiV1Controller = container.get<ApiV1Controller>(
  DependencyIds.apiV1Controller,
)
const urlCheckController = container.get<UrlCheckController>(
  DependencyIds.urlCheckController,
)
const fileCheckController = container.get<FileCheckController>(
  DependencyIds.fileCheckController,
)
const validator = createValidator({ passError: true })
const router = Express.Router()

const fileUploadMiddleware = fileUpload({
  limits: {
    fileSize: MAX_FILE_UPLOAD_SIZE, // 20MB
    files: 1,
  },
})

/**
 * Place incoming file into the request body so that it can be
 * validated together with the other fields by Joi.
 */
function preprocessFormData(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  if (req.files) {
    req.body.files = req.files
  }
  next()
}

/**
 * Place short URL into the request body so that it can be
 * validated together with the other fields by Joi.
 */
function preprocessShortUrl(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  const { shortUrl } = req.params
  if (shortUrl) {
    req.body.shortUrl = shortUrl
  }
  next()
}

router.get(
  '/urls',
  validator.body(urlRetrievalSchema),
  validator.query(userUrlsQueryConditions),
  apiV1Controller.getUrlsWithConditions,
)

router.post(
  '/urls',
  fileUploadMiddleware,
  preprocessFormData,
  validator.body(urlSchema),
  fileCheckController.singleFileCheck,
  fileCheckController.fileExtensionAndMimeTypeCheck(),
  fileCheckController.fileVirusCheck,
  urlCheckController.singleUrlCheck,
  apiV1Controller.createUrl,
)

router.patch(
  '/urls/:shortUrl',
  preprocessShortUrl,
  fileUploadMiddleware,
  preprocessFormData,
  validator.body(urlEditSchema),
  fileCheckController.singleFileCheck,
  fileCheckController.fileExtensionAndMimeTypeCheck(),
  fileCheckController.fileVirusCheck,
  urlCheckController.singleUrlCheck,
  apiV1Controller.updateUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
