import { z } from 'zod'

import { ACTIVE, INACTIVE } from '../../models/types.js'
import {
  longUrlSchema,
  optionalLongUrlSchema,
  optionalShortUrlSchema,
  optionalUrlStateSchema,
  userIdSchema,
} from '../shared/schemas.js'

export const urlRetrievalSchema = z.object({
  userId: userIdSchema,
})

const booleanQueryParam = z.preprocess((value) => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return value
}, z.boolean().optional())

export const userUrlsQueryConditions = z.object({
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  limit: z.coerce.number().int().min(0).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(['createdAt', 'clicks']).optional(),
  sortDirection: z.enum(['desc', 'asc']).optional(),
  searchText: z.string().toLowerCase().optional(),
  state: z.enum([ACTIVE, INACTIVE]).optional(),
  isFile: booleanQueryParam,
})

export const urlSchema = z.object({
  userId: userIdSchema,
  shortUrl: optionalShortUrlSchema,
  longUrl: longUrlSchema,
})

export const urlEditSchema = z.object({
  userId: userIdSchema,
  shortUrl: z.string(),
  longUrl: optionalLongUrlSchema,
  state: optionalUrlStateSchema,
})
