import Express from 'express'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'
import { container } from '../util/inversify.js'
import { JobController } from '../modules/job/index.js'
import { DependencyIds } from '../constants.js'

const router = Express.Router()
const validator = createValidator({ passError: true })

const jobController = container.get<JobController>(DependencyIds.jobController)

const jobItemCallbackSchema = Joi.object({
  userId: Joi.number(),
  jobItemId: Joi.string().required(),
  status: Joi.object()
    .keys({
      isSuccess: Joi.boolean().required(),
      errorMessage: Joi.string().allow(null, ''),
    })
    .required(),
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
