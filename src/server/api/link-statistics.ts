import Express from 'express'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'

import { DependencyIds } from '../constants'
import { container } from '../util/inversify'
import { LinkStatisticsController } from '../modules/analytics'
import { isValidShortUrl } from '../../shared/util/validation'

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

module.exports = router
