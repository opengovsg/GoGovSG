import * as Joi from '@hapi/joi'
import blacklist from '../../resources/blacklist'
import { isHttps, isValidShortUrl } from '../../../shared/util/validation'

const urlSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isValidShortUrl(url)) {
        return helpers.message({ custom: 'Short url format is invalid.' })
      }
      return url
    })
    .required(),
  longUrl: Joi.string()
    .custom((url: string, helpers) => {
      if (!isHttps(url)) {
        return helpers.message({ custom: 'Long url must start with https://' })
      }
      if (blacklist.some((bl) => url.includes(bl))) {
        return helpers.message({
          custom: 'Creation of URLs to link shortener sites prohibited.',
        })
      }
      return url
    })
    .required(),
})

export default urlSchema
