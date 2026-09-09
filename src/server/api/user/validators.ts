import * as Joi from 'joi'
import { ACTIVE, INACTIVE } from '../../models/types'
import {
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isValidShortUrl,
  isValidTag,
  isValidUrl,
} from '../../../shared/util/validation'
import { ogHostname } from '../../config'
import {
  contactEmailSchema,
  descriptionSchema,
  tagSchema,
} from '../shared/linkFieldValidators'

export const urlRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

export const tagRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

export const hasApiKeySchema = Joi.object({
  userId: Joi.number().required(),
})

export const userUrlsQueryConditions = Joi.object({
  userId: Joi.number().required(),
  // eslint-disable-next-line newline-per-chained-call
  limit: Joi.number().integer().min(0).max(1000).required(),
  offset: Joi.number().integer().min(0).optional(),
  orderBy: Joi.string().valid('createdAt', 'clicks').optional(),
  sortDirection: Joi.string().valid('desc', 'asc').optional(),
  searchText: Joi.string().lowercase().allow('').optional(),
  state: Joi.string().valid(ACTIVE, INACTIVE).optional(),
  isFile: Joi.boolean().optional(),
  tags: tagSchema.max(5),
}).oxor('searchText', 'tags')

export const userTagsQueryConditions = Joi.object({
  userId: Joi.number().required(),
  searchText: Joi.string()
    .min(3)
    .custom((tag: string, helpers) => {
      if (!isValidTag(tag)) {
        return helpers.error('tag:invalid')
      }
      return tag
    })
    .messages({ 'tag:invalid': 'Tag format is invalid.' })
    .required(),

  limit: Joi.number().required(),
})

export const urlSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Short URL format is invalid.' })
      }
      return url
    })
    .required(),
  longUrl: Joi.string().custom((url: string, helpers) => {
    if (!isHttps(url)) {
      return helpers.message({ custom: 'Only HTTPS URLs are allowed.' })
    }
    if (!isValidUrl(url)) {
      return helpers.message({ custom: 'Long URL format is invalid.' })
    }
    if (isCircularRedirects(url, ogHostname)) {
      return helpers.message({ custom: 'Circular redirects are not allowed.' })
    }
    if (isBlacklisted(url)) {
      return helpers.message({
        custom: 'Creation of URLs to link shortener sites are not allowed.',
      })
    }
    return url
  }),
  tags: tagSchema,
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
}).xor('longUrl', 'files')

export const urlBulkSchema = Joi.object({
  userId: Joi.number().required(),
  tags: tagSchema,
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
})

export const urlEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  longUrl: Joi.string().custom((url: string, helpers) => {
    if (!isHttps(url)) {
      return helpers.message({ custom: 'Only HTTPS URLs are allowed.' })
    }
    if (!isValidUrl(url)) {
      return helpers.message({ custom: 'Invalid URLs are not allowed.' })
    }
    if (isCircularRedirects(url, ogHostname)) {
      return helpers.message({ custom: 'Circular redirects are not allowed.' })
    }
    if (isBlacklisted(url)) {
      return helpers.message({
        custom: 'Creation of URLs to link shortener sites are not allowed.',
      })
    }
    return url
  }),
  tags: tagSchema,
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
  state: Joi.string().allow(ACTIVE, INACTIVE).only(),
  description: descriptionSchema,
  contactEmail: contactEmailSchema,
}).oxor('longUrl', 'files')

export const ownershipTransferSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  newUserEmail: Joi.string().required(),
})

export const pollJobInformationSchema = Joi.object({
  jobId: Joi.number().required(),
})
