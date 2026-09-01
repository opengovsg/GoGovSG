import * as Joi from 'joi'
import { isPrintableAscii, isValidTag } from '../../../shared/util/validation'
import {
  LINK_DESCRIPTION_MAX_LENGTH,
  MAX_NUM_TAGS_PER_LINK,
} from '../../../shared/constants'
import { isValidGovEmail } from '../../util/email'

const singleTagSchema = Joi.string()
  .pattern(/^[A-Za-z0-9-_]+$/)
  .max(25)

export const tagSchema = Joi.array()
  .max(MAX_NUM_TAGS_PER_LINK)
  .optional()
  .items(
    singleTagSchema
      .custom((tag: string, helpers) => {
        if (!isValidTag(tag)) {
          return helpers.error('tag:invalid')
        }
        return tag
      })
      .messages({ 'tag:invalid': 'Tag format is invalid.' }),
  )
  .unique((a, b) => a === b)

export const descriptionSchema = Joi.string()
  .allow('')
  .max(LINK_DESCRIPTION_MAX_LENGTH)
  .custom((description: string, helpers) => {
    if (!isPrintableAscii(description)) {
      return helpers.message({
        custom: 'Description must only contain ASCII characters.',
      })
    }
    return description
  })

export const contactEmailSchema = Joi.string()
  .allow(null)
  .custom((email: string, helpers) => {
    if (!isValidGovEmail(email)) {
      return helpers.message({ custom: 'Not a valid gov email or null' })
    }
    return email
  })
