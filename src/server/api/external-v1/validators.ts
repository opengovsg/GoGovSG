import * as Joi from 'joi'
import {
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isValidShortUrl,
  isValidUrl,
} from '../../../shared/util/validation'
import { ogHostname } from '../../config'
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
        return helpers.message({ custom: 'Short URL format is invalid.' })
      }
      return url
    })
    .optional(),
  longUrl: Joi.string()
    .custom((url: string, helpers) => {
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
    })
    .required(),
})

export const urlEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  longUrl: Joi.string()
    .custom((url: string, helpers) => {
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
    })
    .optional(),
  state: Joi.string().valid(ACTIVE, INACTIVE).optional(),
})
