import Express from 'express'
import { logOut } from './handlers'

const router = Express.Router()

router.get('/', logOut)

export = router
