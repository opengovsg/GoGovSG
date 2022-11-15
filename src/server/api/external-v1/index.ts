import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiV1Controller } from '../../modules/api/external-v1'
import { UrlCheckController } from '../../modules/threat'
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

router.get(
  '/urls',
  validator.body(urlRetrievalSchema),
  validator.query(userUrlsQueryConditions),
  apiV1Controller.getUrlsWithConditions,
)

router.post(
  '/urls',
  urlCheckController.singleUrlCheck,
  validator.body(urlSchema),
  apiV1Controller.createUrl,
)

/**
 * Endpoint for user to edit a URL. File editing is not allowed.
 */
router.patch(
  '/urls/:shortUrl',
  preprocessShortUrl,
  urlCheckController.singleUrlCheck,
  validator.body(urlEditSchema),
  apiV1Controller.updateUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
