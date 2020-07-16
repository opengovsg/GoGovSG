import Express from 'express'
import { createValidator } from 'express-joi-validation'
import Joi from '@hapi/joi'
import rateLimit from 'express-rate-limit'
import { container } from '../util/inversify'
import { DependencyIds } from '../constants'
import { SearchControllerInterface } from '../controllers/interfaces/SearchControllerInterface'
import getIp from '../util/request'
import { logger } from '../config'
import { SearchResultsSortOrder } from '../../shared/search'

const urlSearchRequestSchema = Joi.object({
  query: Joi.string().required(),
  order: Joi.string()
    .required()
    .allow(...Object.values(SearchResultsSortOrder))
    .only(),
  limit: Joi.number(),
  offset: Joi.number(),
})

const apiLimiter = rateLimit({
  keyGenerator: (req) => getIp(req) as string,
  onLimitReached: (req) =>
    logger.warn(`Rate limit reached for IP Address: ${getIp(req)}`),
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
