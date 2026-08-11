import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify.js'
import jsonMessage from '../../util/json.js'
import { DependencyIds } from '../../constants.js'
import { AdminApiV1Controller } from '../../modules/api/admin-v1/index.js'
import { UrlCheckController } from '../../modules/threat/index.js'
import { urlSchema } from './validators.js'

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

export default router
