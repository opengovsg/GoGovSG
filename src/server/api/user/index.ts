import Express from 'express'
import fileUpload from 'express-fileupload'
import { createValidator } from 'express-joi-validation'
import { DependencyIds } from '../../constants'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import {
  MAX_CSV_UPLOAD_SIZE,
  MAX_FILE_UPLOAD_SIZE,
} from '../../../shared/constants'
import {
  ownershipTransferSchema,
  tagRetrievalSchema,
  urlBulkSchema,
  urlEditSchema,
  urlRetrievalSchema,
  urlSchema,
} from './validators'
import { UserController } from '../../modules/user'
import { BulkController } from '../../modules/bulk'
import { FileCheckController, UrlCheckController } from '../../modules/threat'

const router = Express.Router()

const userController = container.get<UserController>(
  DependencyIds.userController,
)

const fileCheckController = container.get<FileCheckController>(
  DependencyIds.fileCheckController,
)

const urlCheckController = container.get<UrlCheckController>(
  DependencyIds.urlCheckController,
)

const bulkController = container.get<BulkController>(
  DependencyIds.bulkController,
)

const fileUploadMiddleware = fileUpload({
  limits: {
    fileSize: MAX_FILE_UPLOAD_SIZE, // 10MB
    files: 1,
  },
})

const bulkCSVUploadMiddleware = fileUpload({
  limits: {
    fileSize: MAX_CSV_UPLOAD_SIZE, // 5MB
    files: 1,
  },
})

const validator = createValidator({ passError: true })

/**
 * Place incoming file into the request body so that it can be
 * validated together with the other fields by Joi.
 */
function preprocessPotentialIncomingFile(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  if (req.files) {
    req.body.files = req.files
    // if (req.body.tags) {
    //   // Tags for files sent as FormData should be deserialised from JSON format
    //   try {
    //     req.body.tags = JSON.parse(req.body.tags)
    //   } catch (e) {
    //     res.badRequest(jsonMessage('Tags are invalid.'))
    //     return
    //   }
    // }
  }
  next()
}

/**
 * Endpoint for a user to create a short URL. A short URL can either point to
 * a long URL, or a file provided by the user.
 *
 * In order to create a file URL, provide the `isFile` parameter set to `true`, and supply
 * the binary in a multipart/form-data under the field titled `file`. The longUrl
 * parameter in the request body must point to the s3 bucket with the correct key. For
 * example, a file upload request for the shortUrl named `test` should have `longUrl` set
 * to `https://file[-staging].go.gov.sg/test`.
 */
router.post(
  '/url',
  fileUploadMiddleware,
  preprocessPotentialIncomingFile,
  fileCheckController.singleFileCheck,
  fileCheckController.fileExtensionCheck(),
  fileCheckController.fileVirusCheck,
  urlCheckController.singleUrlCheck,
  validator.body(urlSchema),
  userController.createUrl,
)

/**
 * Endpoint for a user to bulk create URLs via CSV upload.
 *
 * Validates CSV and throws error if CSV is malformatted or contains malicious links.
 */

router.post(
  '/url/bulk',
  bulkCSVUploadMiddleware,
  preprocessPotentialIncomingFile,
  validator.body(urlBulkSchema),
  fileCheckController.singleFileCheck,
  fileCheckController.fileExtensionCheck(['csv']),
  fileCheckController.fileVirusCheck,
  bulkController.validateAndParseCsv,
  urlCheckController.bulkUrlCheck,
  bulkController.bulkCreate,
)

router.patch(
  '/url/ownership',
  validator.body(ownershipTransferSchema),
  userController.changeOwnership,
)

/**
 * Endpoint for user to edit a file or a longUrl.
 *
 * If editing a file link, only the file can be changed and not
 * the long URL. This is to ensure a one-to-one mapping between
 * the short URL and S3 object key.
 */
router.patch(
  '/url',
  fileUploadMiddleware,
  preprocessPotentialIncomingFile,
  fileCheckController.singleFileCheck,
  fileCheckController.fileExtensionCheck(),
  fileCheckController.fileVirusCheck,
  urlCheckController.singleUrlCheck,
  validator.body(urlEditSchema),
  userController.updateUrl,
)

/**
 * Endpoint for a user to retrieve their own URLs based on the query conditions.
 */
router.get(
  '/url',
  validator.body(urlRetrievalSchema),
  userController.getUrlsWithConditions,
)

router.get(
  '/tag',
  validator.body(tagRetrievalSchema),
  userController.getTagsWithConditions,
)

router.get('/message', userController.getUserMessage)

router.get('/announcement', userController.getUserAnnouncement)

export = router
