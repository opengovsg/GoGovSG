import * as Joi from '@hapi/joi'
import {
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isValidShortUrl,
  isValidUrl,
} from '../../../shared/util/validation'
import { ogHostname } from '../../config'

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
  email: Joi.string().optional(),
})

export default urlSchema
