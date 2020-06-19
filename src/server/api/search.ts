import Express from 'express'
import { createValidator } from 'express-joi-validation'
import Joi from '@hapi/joi'
import { container } from '../util/inversify'
import { DependencyIds } from '../constants'
import { SearchControllerInterface } from '../controllers/interfaces/SearchControllerInterface'

const urlSearchRequestSchema = Joi.object({
  query: Joi.string().required(),
  limit: Joi.number(),
  offset: Joi.number(),
})

const router = Express.Router()
const validator = createValidator()
const searchController = container.get<SearchControllerInterface>(
  DependencyIds.searchController,
)

router.get(
  '/urls',
  validator.query(urlSearchRequestSchema),
  searchController.urlSearchPlainText,
)

module.exports = router
