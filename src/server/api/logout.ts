import Express from 'express'
import { container } from '../util/inversify.js'
import { LogoutController } from '../modules/auth/LogoutController.js'
import { DependencyIds } from '../constants.js'

const router = Express.Router()
const logoutController = container.get<LogoutController>(
  DependencyIds.logoutController,
)

router.get('/', logoutController.logOut)

export default router
