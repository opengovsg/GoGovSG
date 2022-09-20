import * as Joi from '@hapi/joi'
import { ACTIVE, INACTIVE } from '../../models/types'
import blacklist from '../../resources/blacklist'
import {
  isHttps,
  isPrintableAscii,
  isValidShortUrl,
  isValidTag,
} from '../../../shared/util/validation'
import {
  LINK_DESCRIPTION_MAX_LENGTH,
  MAX_NUM_TAGS_PER_LINK,
} from '../../../shared/constants'
import { isValidGovEmail } from '../../util/email'

export const urlRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

export const tagRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

const tagSchema = Joi.array()
  .max(MAX_NUM_TAGS_PER_LINK)
  .optional()
  .items(
    Joi.string().custom((tag: string, helpers) => {
      if (!isValidTag(tag)) {
        return helpers.message({ custom: `tag: ${tag} format is invalid` })
      }
      return tag
    }),
  )
  .unique((a, b) => a === b)

export const userUrlsQueryConditions = Joi.object({
  userId: Joi.number().required(),
  limit: Joi.number().required(),
  offset: Joi.number().optional(),
  orderBy: Joi.string().valid('updatedAt', 'createdAt', 'clicks').optional(),
  sortDirection: Joi.string().valid('desc', 'asc').optional(),
  searchText: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  isFile: Joi.boolean().optional(),
  tags: tagSchema.max(5),
})

export const userTagsQueryConditions = Joi.object({
  userId: Joi.number().required(),
  searchText: Joi.string()
    .min(3)
    .custom((tag: string, helpers) => {
      if (!isValidTag(tag)) {
        return helpers.message({
          custom: `tag: ${tag} query format is invalid.`,
        })
      }
      return tag
    })
    .required(),
  limit: Joi.number().required(),
})

export const urlSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Short url format is invalid.' })
      }
      return url
    })
    .required(),
  longUrl: Joi.string().custom((url: string, helpers) => {
    if (!isHttps(url)) {
      return helpers.message({ custom: 'Long url must start with https://' })
    }
    if (blacklist.some((bl) => url.includes(bl))) {
      return helpers.message({
        custom: 'Creation of URLs to link shortener sites prohibited.',
      })
    }
    return url
  }),
  tags: tagSchema,
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
}).xor('longUrl', 'files')

export const urlEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  longUrl: Joi.string().custom((url: string, helpers) => {
    if (!isHttps(url)) {
      return helpers.message({ custom: 'Long url must start with https://' })
    }
    if (blacklist.some((bl) => url.includes(bl))) {
      return helpers.message({
        custom: 'Creation of URLs to link shortener sites prohibited.',
      })
    }
    return url
  }),
  tags: tagSchema,
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
  state: Joi.string().allow(ACTIVE, INACTIVE).only(),
  description: Joi.string()
    .allow('')
    .max(LINK_DESCRIPTION_MAX_LENGTH)
    .custom((description: string, helpers) => {
      if (!isPrintableAscii(description)) {
        return helpers.message({
          custom: 'Description must only contain ASCII characters.',
        })
      }
      return description
    }),
  contactEmail: Joi.string()
    .allow(null)
    .custom((email: string, helpers) => {
      if (!isValidGovEmail(email)) {
        return helpers.message({ custom: 'Not a valid gov email or null' })
      }
      return email
    }),
}).oxor('longUrl', 'files')

export const ownershipTransferSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  newUserEmail: Joi.string().required(),
})
