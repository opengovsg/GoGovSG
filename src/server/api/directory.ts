import Express from 'express'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'
import { container } from '../util/inversify.js'
import { DependencyIds } from '../constants.js'
import { ACTIVE, INACTIVE } from '../models/types.js'
import { DirectoryController } from '../modules/directory/index.js'
import { SearchResultsSortOrder } from '../../shared/search.js'

const urlSearchRequestSchema = Joi.object({
  query: Joi.string().required(),
  order: Joi.string()
    .required()
    .allow(...Object.values(SearchResultsSortOrder))
    .only(),
  limit: Joi.number(),
  offset: Joi.number(),
  state: Joi.string().valid(ACTIVE, INACTIVE),
  isFile: Joi.string().allow(''),
  isEmail: Joi.string().required(),
})

const router = Express.Router()
const validator = createValidator({ passError: true })
const directoryController = container.get<DirectoryController>(
  DependencyIds.directoryController,
)

router.get(
  '/search',
  validator.query(urlSearchRequestSchema),
  directoryController.getDirectoryWithConditions,
)

export default router
