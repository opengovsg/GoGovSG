import Express from 'express'
import { z } from 'zod'

import { DependencyIds } from '../constants.js'
import { container } from '../util/inversify.js'
import { LinkStatisticsController } from '../modules/analytics/index.js'
import { isValidShortUrl } from '../../shared/util/validation.js'
import { createValidator } from '../util/zodValidator.js'

const router = Express.Router()
const validator = createValidator()

const statisticsController = container.get<LinkStatisticsController>(
  DependencyIds.linkStatisticsController,
)

/**
 * Determines whether the link statistics request is valid.
 */
const linkStatisticsSchema = z.object({
  url: z.string().superRefine((url, ctx) => {
    if (!isValidShortUrl(url)) {
      ctx.addIssue({ code: 'custom', message: 'Not a valid short link' })
    }
  }),
  offset: z.coerce.number().min(0).optional(),
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
