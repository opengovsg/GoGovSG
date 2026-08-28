import Express from 'express'
import { z } from 'zod'

import { container } from '../util/inversify.js'
import { DependencyIds } from '../constants.js'
import { ACTIVE, INACTIVE } from '../models/types.js'
import { DirectoryController } from '../modules/directory/index.js'
import { SearchResultsSortOrder } from '../../shared/search.js'
import { createValidator } from '../util/zodValidator.js'

const urlSearchRequestSchema = z.object({
  query: z.string(),
  order: z.enum([
    SearchResultsSortOrder.Popularity,
    SearchResultsSortOrder.Recency,
  ]),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  state: z.enum([ACTIVE, INACTIVE]).optional(),
  isFile: z.string().optional(),
  isEmail: z.string(),
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
