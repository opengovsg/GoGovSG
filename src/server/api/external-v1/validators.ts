import * as Joi from '@hapi/joi'
import {
  isBlacklisted,
  isHttps,
  isValidShortUrl,
} from '../../../shared/util/validation'
import { ACTIVE, INACTIVE } from '../../models/types'

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
