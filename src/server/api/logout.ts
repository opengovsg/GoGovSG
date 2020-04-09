import Express from 'express'
import jsonMessage from '../util/json'

const router = Express.Router()

router.get('/', (req, res) => {
  if (req.session) {
    req.session.destroy(() => res.ok(jsonMessage('Logged out')))
    return
  }
  res.serverError(jsonMessage('No session found'))
})

export = router
