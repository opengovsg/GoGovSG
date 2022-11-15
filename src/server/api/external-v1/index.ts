import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiV1Controller } from '../../modules/api/external-v1'
import { UrlCheckController } from '../../modules/threat'
import {
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

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
