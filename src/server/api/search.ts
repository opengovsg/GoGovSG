import Express from 'express'
import { createValidator } from 'express-joi-validation'
import Joi from '@hapi/joi'
import rateLimit from 'express-rate-limit'
import { container } from '../util/inversify'
import { DependencyIds } from '../constants'
import { SearchControllerInterface } from '../controllers/interfaces/SearchControllerInterface'
import { SearchResultsSortOrder } from '../repositories/enums'

const urlSearchRequestSchema = Joi.object({
  query: Joi.string().required(),
  order: Joi.string().allow(Object.values(SearchResultsSortOrder)),
  limit: Joi.number(),
  offset: Joi.number(),
})

const apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20,
})

const router = Express.Router()
const validator = createValidator()
const searchController = container.get<SearchControllerInterface>(
  DependencyIds.searchController,
)

router.get(
  '/urls',
  apiLimiter,
  validator.query(urlSearchRequestSchema),
  searchController.urlSearchPlainText,
)

module.exports = router
