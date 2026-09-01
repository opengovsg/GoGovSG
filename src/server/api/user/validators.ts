import { z } from 'zod'

import { ACTIVE, INACTIVE } from '../../models/types.js'
import { isValidTag } from '../../../shared/util/validation.js'
import {
  contactEmailSchema,
  descriptionSchema,
  editLongUrlSchema,
  fileUploadSchema,
  longUrlSchema,
  optionalUrlStateSchema,
  shortUrlSchema,
  tagSchema,
  userIdSchema,
} from '../shared/schemas.js'

const userUrlsTagsSchema = z
  .array(
    z
      .string()
      .regex(/^[A-Za-z0-9-_]+$/)
      .max(25)
      .superRefine((tag, ctx) => {
        if (!isValidTag(tag)) {
          ctx.addIssue({ code: 'custom', message: 'Tag format is invalid.' })
        }
      }),
  )
  .max(5)
  .refine((tags) => new Set(tags).size === tags.length, {
    message: 'Tag format is invalid.',
  })
  .optional()

const optionalExclusivePeersMessage =
  'contains a conflict between optional exclusive peers'

const exclusivePeersMessage = 'contains a conflict between exclusive peers'

export const urlRetrievalSchema = z.object({
  userId: userIdSchema,
})

export const tagRetrievalSchema = z.object({
  userId: userIdSchema,
})

export const hasApiKeySchema = z.object({
  userId: userIdSchema,
})

export const userUrlsQueryConditions = z
  .object({
    userId: userIdSchema,
    limit: z.number().int().min(0).max(1000),
    offset: z.number().int().min(0).optional(),
    orderBy: z.enum(['createdAt', 'clicks']).optional(),
    sortDirection: z.enum(['desc', 'asc']).optional(),
    searchText: z.string().optional(),
    state: z.enum([ACTIVE, INACTIVE]).optional(),
    isFile: z.boolean().optional(),
    tags: userUrlsTagsSchema,
  })
  .refine((data) => !(data.searchText && data.tags?.length), {
    message: `${optionalExclusivePeersMessage} [searchText, tags]`,
  })

export const userTagsQueryConditions = z.object({
  userId: userIdSchema,
  searchText: z
    .string()
    .min(3)
    .superRefine((tag, ctx) => {
      if (!isValidTag(tag)) {
        ctx.addIssue({ code: 'custom', message: 'Tag format is invalid.' })
      }
    }),
  limit: z.number(),
})

export const urlSchema = z
  .object({
    userId: userIdSchema,
    shortUrl: shortUrlSchema,
    longUrl: longUrlSchema.optional(),
    tags: tagSchema,
    files: fileUploadSchema.optional(),
  })
  .refine((data) => Boolean(data.longUrl) !== Boolean(data.files), {
    message: `${exclusivePeersMessage} [longUrl, files]`,
  })

export const urlBulkSchema = z.object({
  userId: userIdSchema,
  tags: tagSchema,
  files: fileUploadSchema,
})

export const urlEditSchema = z
  .object({
    userId: userIdSchema,
    shortUrl: z.string(),
    longUrl: editLongUrlSchema.optional(),
    tags: tagSchema,
    files: fileUploadSchema.optional(),
    state: optionalUrlStateSchema,
    description: descriptionSchema.optional(),
    contactEmail: contactEmailSchema.optional(),
  })
  .refine((data) => !(data.longUrl && data.files), {
    message: `${optionalExclusivePeersMessage} [longUrl, files]`,
  })

export const ownershipTransferSchema = z.object({
  userId: userIdSchema,
  shortUrl: z.string(),
  newUserEmail: z.string(),
})

export const pollJobInformationSchema = z.object({
  jobId: z.coerce.number(),
})

export type UserUrlsQueryConditionsInput = z.infer<
  typeof userUrlsQueryConditions
>
export type UserTagsQueryConditionsInput = z.infer<
  typeof userTagsQueryConditions
>
