import * as Joi from '@hapi/joi'
import { ACTIVE, INACTIVE } from '../../models/types'
import blacklist from '../../resources/blacklist'
import { isHttps, isValidShortUrl } from '../../../shared/util/validation'
import { LINK_DESCRIPTION_MAX_LENGTH } from '../../../shared/constants'

export const urlRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
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
  files: Joi.object({
    file: Joi.object().keys().required(),
  }),
  state: Joi.string().allow(ACTIVE, INACTIVE).only(),
  description: Joi.string().length(LINK_DESCRIPTION_MAX_LENGTH),
  // TODO: Validator for email
  contactEmail: Joi.string().required(),
}).oxor('longUrl', 'files')

export const ownershipTransferSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  newUserEmail: Joi.string().required(),
})
