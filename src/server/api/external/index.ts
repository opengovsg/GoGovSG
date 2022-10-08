import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { container } from '../../util/inversify'
import { DependencyIds } from '../../constants'
import { urlSchema } from '../user/validators'
import { UserController } from '../../modules/user'
import { UrlCheckController } from '../../modules/threat'

const userController = container.get<UserController>(
  DependencyIds.userController,
)
const urlCheckController = container.get<UrlCheckController>(
  DependencyIds.urlCheckController,
)
const validator = createValidator({ passError: true })
const router = Express.Router()

router.post(
  '/urls',
  urlCheckController.checkUrl,
  validator.body(urlSchema),
  userController.createUrl,
)

export = router
