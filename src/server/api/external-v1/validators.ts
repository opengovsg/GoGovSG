import * as Joi from 'joi'
import {
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isValidShortUrl,
  isValidUrl,
} from '../../../shared/util/validation'
import { bulkUploadMaxNum, ogHostname } from '../../config'
import { ACTIVE, INACTIVE } from '../../models/types'

const longUrlRules = (url: string, helpers: Joi.CustomHelpers) => {
  if (!isHttps(url)) {
    return helpers.message({ custom: 'Only HTTPS URLs are allowed.' })
  }
  if (!isValidUrl(url)) {
    return helpers.message({ custom: 'Long URL format is invalid.' })
  }
  if (isCircularRedirects(url, ogHostname)) {
    return helpers.message({
      custom: 'Circular redirects are not allowed.',
    })
  }
  if (isBlacklisted(url)) {
    return helpers.message({
      custom: 'Creation of URLs to link shortener sites are not allowed.',
    })
  }
  return url
}

const longUrlValidator = Joi.string().custom(longUrlRules).required()
const optionalLongUrlValidator = Joi.string().custom(longUrlRules).optional()

const shortUrlValidator = Joi.string()
  .custom((url: string, helpers) => {
    if (!isValidShortUrl(url)) {
      return helpers.message({ custom: 'Short URL format is invalid.' })
    }
    return url
  })
  .optional()

export const urlRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

export const userUrlsQueryConditions = Joi.object({
  // eslint-disable-next-line newline-per-chained-call
  limit: Joi.number().integer().min(0).max(1000).optional(),
  offset: Joi.number().integer().min(0).optional(),
  orderBy: Joi.string().valid('createdAt', 'clicks').optional(),
  sortDirection: Joi.string().valid('desc', 'asc').optional(),
  searchText: Joi.string().lowercase().allow('').optional(),
  state: Joi.string().valid(ACTIVE, INACTIVE).optional(),
  isFile: Joi.boolean().optional(),
})

export const urlSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: shortUrlValidator,
  longUrl: longUrlValidator,
})

export const urlBulkRowSchema = Joi.object({
  longUrl: longUrlValidator,
  shortUrl: shortUrlValidator,
})

export const urlBulkSchema = Joi.object({
  userId: Joi.number().required(),
  urls: Joi.array()
    .items(Joi.object().unknown(false))
    .min(1)
    .max(bulkUploadMaxNum)
    .required(),
})

export const urlEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  longUrl: optionalLongUrlValidator,
  state: Joi.string().valid(ACTIVE, INACTIVE).optional(),
})
