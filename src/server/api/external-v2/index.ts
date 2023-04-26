import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiV2Controller } from '../../modules/api/external-v2'
import { UrlCheckController } from '../../modules/threat'
import { urlSchema } from './validators'

const apiV2Controller = container.get<ApiV2Controller>(
  DependencyIds.apiV2Controller,
)
const urlCheckController = container.get<UrlCheckController>(
  DependencyIds.urlCheckController,
)
const validator = createValidator({ passError: true })
const router = Express.Router()

router.post(
  '/urls',
  validator.body(urlSchema),
  urlCheckController.singleUrlCheck,
  apiV2Controller.createUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
