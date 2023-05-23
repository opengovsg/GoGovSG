import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import jsonMessage from '../../util/json'
import { DependencyIds } from '../../constants'
import { AdminApiV1Controller } from '../../modules/api/admin-v1'
import { UrlCheckController } from '../../modules/threat'
import { urlSchema } from './validators'

const adminApiV1Controller = container.get<AdminApiV1Controller>(
  DependencyIds.adminApiV1Controller,
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
  adminApiV1Controller.createUrl,
)

router.use((_, res) => {
  res.status(404).send(jsonMessage('Resource not found.'))
})

export = router
