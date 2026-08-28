import { z } from 'zod'

import {
  govEmailSchema,
  longUrlSchema,
  optionalShortUrlSchema,
  userIdSchema,
} from '../shared/schemas.js'

export const urlSchema = z.object({
  userId: userIdSchema,
  shortUrl: optionalShortUrlSchema,
  longUrl: longUrlSchema,
  email: govEmailSchema(
    'Invalid email provided. Email domain is not whitelisted.',
  ),
})

export default urlSchema
