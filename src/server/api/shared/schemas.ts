import { z } from 'zod'

import { ACTIVE, INACTIVE } from '../../models/types.js'
import { ogHostname } from '../../config.js'
import { isValidGovEmail } from '../../util/email.js'
import {
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isPrintableAscii,
  isValidShortUrl,
  isValidTag,
  isValidUrl,
} from '../../../shared/util/validation.js'
import {
  LINK_DESCRIPTION_MAX_LENGTH,
  MAX_NUM_TAGS_PER_LINK,
} from '../../../shared/constants.js'

const shortUrlMessage = 'Short URL format is invalid.'
const httpsMessage = 'Only HTTPS URLs are allowed.'
const longUrlMessage = 'Long URL format is invalid.'
const circularRedirectMessage = 'Circular redirects are not allowed.'
const blacklistedUrlMessage =
  'Creation of URLs to link shortener sites are not allowed.'

export const shortUrlSchema = z.string().superRefine((url, ctx) => {
  if (!isValidShortUrl(url)) {
    ctx.addIssue({ code: 'custom', message: shortUrlMessage })
  }
})

export const optionalShortUrlSchema = z
  .string()
  .optional()
  .superRefine((url, ctx) => {
    if (url !== undefined && !isValidShortUrl(url)) {
      ctx.addIssue({ code: 'custom', message: shortUrlMessage })
    }
  })

export const longUrlSchema = z.string().superRefine((url, ctx) => {
  if (!isHttps(url)) {
    ctx.addIssue({ code: 'custom', message: httpsMessage })
    return
  }
  if (!isValidUrl(url)) {
    ctx.addIssue({ code: 'custom', message: longUrlMessage })
    return
  }
  if (isCircularRedirects(url, ogHostname)) {
    ctx.addIssue({ code: 'custom', message: circularRedirectMessage })
    return
  }
  if (isBlacklisted(url)) {
    ctx.addIssue({ code: 'custom', message: blacklistedUrlMessage })
  }
})

export const optionalLongUrlSchema = z
  .string()
  .optional()
  .superRefine((url, ctx) => {
    if (url === undefined) {
      return
    }
    if (!isHttps(url)) {
      ctx.addIssue({ code: 'custom', message: httpsMessage })
      return
    }
    if (!isValidUrl(url)) {
      ctx.addIssue({ code: 'custom', message: longUrlMessage })
      return
    }
    if (isCircularRedirects(url, ogHostname)) {
      ctx.addIssue({ code: 'custom', message: circularRedirectMessage })
      return
    }
    if (isBlacklisted(url)) {
      ctx.addIssue({ code: 'custom', message: blacklistedUrlMessage })
    }
  })

export const editLongUrlSchema = z.string().superRefine((url, ctx) => {
  if (!isHttps(url)) {
    ctx.addIssue({ code: 'custom', message: httpsMessage })
    return
  }
  if (!isValidUrl(url)) {
    ctx.addIssue({ code: 'custom', message: 'Invalid URLs are not allowed.' })
    return
  }
  if (isCircularRedirects(url, ogHostname)) {
    ctx.addIssue({ code: 'custom', message: circularRedirectMessage })
    return
  }
  if (isBlacklisted(url)) {
    ctx.addIssue({ code: 'custom', message: blacklistedUrlMessage })
  }
})

export const govEmailSchema = (message: string) =>
  z.string().superRefine((email, ctx) => {
    if (!isValidGovEmail(email)) {
      ctx.addIssue({ code: 'custom', message })
    }
  })

export const tagSchema = z
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
  .max(MAX_NUM_TAGS_PER_LINK)
  .refine((tags) => new Set(tags).size === tags.length, {
    message: 'Tag format is invalid.',
  })
  .optional()

export const urlStateSchema = z.enum([ACTIVE, INACTIVE])

export const optionalUrlStateSchema = urlStateSchema.optional()

export const descriptionSchema = z
  .string()
  .max(LINK_DESCRIPTION_MAX_LENGTH)
  .superRefine((description, ctx) => {
    if (!isPrintableAscii(description)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Description must only contain ASCII characters.',
      })
    }
  })

export const contactEmailSchema = z
  .union([z.string(), z.null()])
  .superRefine((email, ctx) => {
    if (email !== null && !isValidGovEmail(email)) {
      ctx.addIssue({ code: 'custom', message: 'Not a valid gov email or null' })
    }
  })

export const userIdSchema = z.number()

export const fileUploadSchema = z.object({
  file: z.record(z.string(), z.unknown()),
})

export const filesSchema = z.object({
  files: fileUploadSchema,
})
