import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiV1Controller } from '../../modules/api/external-v1'
import { UrlCheckController } from '../../modules/threat'
import {
  extractBulkRowValidationError,
  urlBulkRowSchema,
  urlBulkSchema,
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
const validator = createValidator({ passError: true })
const router = Express.Router()

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

function preprocessExternalBulkRows(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  const { urls } = req.body
  const validatedBulkRows: {
    index: number
    longUrl: string
    shortUrl?: string
  }[] = []
  const bulkValidationErrors: {
    index: number
    message: string
    type?: string
  }[] = []

  urls.forEach((row: unknown, index: number) => {
    const { error, value } = urlBulkRowSchema.validate(row, {
      abortEarly: true,
    })
    if (error) {
      bulkValidationErrors.push({
        index,
        ...extractBulkRowValidationError(error),
      })
      return
    }
    validatedBulkRows.push({
      index,
      longUrl: value.longUrl,
      shortUrl: value.shortUrl,
    })
  })

  req.body.validatedBulkRows = validatedBulkRows
  req.body.bulkValidationErrors = bulkValidationErrors
  req.body.longUrls = validatedBulkRows.map((row) => row.longUrl)
  next()
}

router.get(
  '/urls',
  validator.body(urlRetrievalSchema),
  validator.query(userUrlsQueryConditions),
  apiV1Controller.getUrlsWithConditions,
)

router.post(
  '/urls/bulk',
  validator.body(urlBulkSchema),
  preprocessExternalBulkRows,
  urlCheckController.bulkUrlCheck,
  apiV1Controller.bulkCreateUrls,
)

router.post(
  '/urls',
  validator.body(urlSchema),
  urlCheckController.singleUrlCheck,
  apiV1Controller.createUrl,
)

/**
 * Endpoint for user to edit a URL. File editing is not allowed.
 */
router.patch(
  '/urls/:shortUrl',
  preprocessShortUrl,
  validator.body(urlEditSchema),
  urlCheckController.singleUrlCheck,
  apiV1Controller.updateUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
