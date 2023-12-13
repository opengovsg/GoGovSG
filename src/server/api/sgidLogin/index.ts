import Express from 'express'
import { SgidLoginController } from '../../modules/auth'
import { container } from '../../util/inversify'
import { DependencyIds } from '../../constants'

const router: Express.Router = Express.Router()

const sgidLoginController = container.get<SgidLoginController>(
  DependencyIds.sgidLoginController,
)

router.get('/authurl', sgidLoginController.generateAuthUrl)

router.get('/authenticate', sgidLoginController.handleLogin)

module.exports = router
