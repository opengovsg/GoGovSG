import Express from 'express'
import Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'
import { DependencyIds } from '../constants'
import { LinkAuditController } from '../modules/audit'
import { container } from '../util/inversify'
import { isValidShortUrl } from '../../shared/util/validation'

const router = Express.Router()
const validator = createValidator()

const auditController = container.get<LinkAuditController>(
  DependencyIds.linkAuditController,
)

/**
 * Determines whether the link audit request is valid.
 */
const linkAuditSchema = Joi.object({
  url: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Not a valid short link' })
      }
      return url
    })
    .required(),
  limit: Joi.number().min(0),
  offset: Joi.number().min(0),
})

/**
 * Endpoint to retrieve link audit for a specified link.
 */
router.get('/', validator.query(linkAuditSchema), auditController.getLinkAudit)

module.exports = router
