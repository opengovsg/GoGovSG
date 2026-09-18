import Express from 'express'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'
import { DependencyIds } from '../constants.js'
import { LinkAuditController } from '../modules/audit/index.js'
import { container } from '../util/inversify.js'
import { isValidShortUrl } from '../../shared/util/validation.js'

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

export default router
