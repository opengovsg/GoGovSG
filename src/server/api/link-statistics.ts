import Express from 'express'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'

import { DependencyIds } from '../constants.js'
import { container } from '../util/inversify.js'
import { LinkStatisticsController } from '../modules/analytics/index.js'
import { isValidShortUrl } from '../../shared/util/validation.js'

const router = Express.Router()
const validator = createValidator()

const statisticsController = container.get<LinkStatisticsController>(
  DependencyIds.linkStatisticsController,
)

/**
 * Determines whether the link statistics request is valid.
 */
const linkStatisticsSchema = Joi.object({
  url: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Not a valid short link' })
      }
      return url
    })
    .required(),
  offset: Joi.number().min(0),
})

/**
 * Endpoint to retrieve link statistics for a specified link.
 */
router.get(
  '/',
  validator.query(linkStatisticsSchema),
  statisticsController.getLinkStatistics,
)

export default router
