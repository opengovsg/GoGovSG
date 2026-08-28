import Express from 'express'
import { z } from 'zod'

import { container } from '../util/inversify.js'
import { JobController } from '../modules/job/index.js'
import { DependencyIds } from '../constants.js'
import { createValidator } from '../util/zodValidator.js'

const router = Express.Router()
const validator = createValidator({ passError: true })

const jobController = container.get<JobController>(DependencyIds.jobController)

const jobItemCallbackSchema = z.object({
  userId: z.number().optional(),
  jobItemId: z.string(),
  status: z.object({
    isSuccess: z.boolean(),
    errorMessage: z.union([z.string(), z.null()]).optional(),
  }),
})
/**
 * Update job status based on callback.
 */
router.post(
  '/qr',
  validator.body(jobItemCallbackSchema),
  jobController.updateJobItem,
  jobController.updateJob,
)

export default router
