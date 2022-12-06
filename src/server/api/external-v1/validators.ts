import * as Joi from '@hapi/joi'
import {
  isBlacklisted,
  isHttps,
  isValidShortUrl,
} from '../../../shared/util/validation'
import { ACTIVE, INACTIVE } from '../../models/types'

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
  shortUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Short url format is invalid.' })
      }
      return url
    })
    .optional(),
  longUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isHttps(url)) {
        return helpers.message({ custom: 'Long url must start with https://' })
      }
      if (isBlacklisted(url)) {
        return helpers.message({
          custom: 'Creation of URLs to link shortener sites prohibited.',
        })
      }
      return url
    })
    .required(),
})

export const urlEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  longUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isHttps(url)) {
        return helpers.message({ custom: 'Long url must start with https://' })
      }
      if (isBlacklisted(url)) {
        return helpers.message({
          custom: 'Creation of URLs to link shortener sites prohibited.',
        })
      }
      return url
    })
    .optional(),
  state: Joi.string().valid(ACTIVE, INACTIVE).optional(),
})
