import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { ApiController } from '../../modules/api/external-v1'
import { UrlCheckController } from '../../modules/threat'
import urlSchema from './validators'

const apiController = container.get<ApiController>(
  DependencyIds.apiControllerv1,
)
const urlCheckController = container.get<UrlCheckController>(
  DependencyIds.urlCheckController,
)
const validator = createValidator({ passError: true })
const router = Express.Router()

router.post(
  '/urls',
  urlCheckController.singleUrlCheck,
  validator.body(urlSchema),
  apiController.createUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
