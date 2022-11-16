import Express from 'express'
import Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'
import { container } from '../util/inversify'
import { JobController } from '../modules/job'
import { DependencyIds } from '../constants'

const router = Express.Router()
const validator = createValidator({ passError: true })

const jobController = container.get<JobController>(DependencyIds.jobController)

const jobItemCallbackSchema = Joi.object({
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
router.post('/', validator.body(jobItemCallbackSchema), jobController.updateJob)

module.exports = router
