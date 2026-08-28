import Express from 'express'
import { z } from 'zod'

import { DependencyIds } from '../constants.js'
import { LinkAuditController } from '../modules/audit/index.js'
import { container } from '../util/inversify.js'
import { isValidShortUrl } from '../../shared/util/validation.js'
import { createValidator } from '../util/zodValidator.js'

const router = Express.Router()
const validator = createValidator()

const auditController = container.get<LinkAuditController>(
  DependencyIds.linkAuditController,
)

/**
 * Determines whether the link audit request is valid.
 */
const linkAuditSchema = z.object({
  url: z.string().superRefine((url, ctx) => {
    if (!isValidShortUrl(url)) {
      ctx.addIssue({ code: 'custom', message: 'Not a valid short link' })
    }
  }),
  limit: z.coerce.number().min(0).optional(),
  offset: z.coerce.number().min(0).optional(),
})

/**
 * Endpoint to retrieve link audit for a specified link.
 */
router.get('/', validator.query(linkAuditSchema), auditController.getLinkAudit)

export default router
