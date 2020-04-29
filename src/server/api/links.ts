import Express from 'express'
import { linksToRotate } from '../config'

const router = Express.Router()

/**
 * Requests for the array of links to rotate.
 */
router.get('/', (_, res) => {
  console.log(linksToRotate)
  return res.send(linksToRotate)
})

module.exports = router
