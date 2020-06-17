import Express from 'express'
import { container } from '../util/inversify'
import { LogoutController } from '../controllers/LogoutController'
import { DependencyIds } from '../constants'

const router = Express.Router()
const logoutController = container.get<LogoutController>(
  DependencyIds.logoutController,
)

router.get('/', logoutController.logOut)

export = router
