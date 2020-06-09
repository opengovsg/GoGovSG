import Express from 'express'
import fileUpload from 'express-fileupload'
import * as Joi from '@hapi/joi'
import { createValidator } from 'express-joi-validation'
import jsonMessage from '../util/json'
import { User, UserType } from '../models/user'
import { Url } from '../models/url'
import { ACTIVE, INACTIVE } from '../models/types'
import { redirectClient } from '../redis'
import blacklist from '../resources/blacklist'
import { isHttps, isValidShortUrl } from '../../shared/util/validation'
import { FileVisibility, S3Interface } from '../util/aws'
import { transaction } from '../util/sequelize'
import { logger } from '../config'
import { DependencyIds } from '../constants'
import { container } from '../util/inversify'
import {
  OwnershipTransferRequest,
  ShorturlStateEditRequest,
  UrlCreationRequest,
  UrlEditRequest,
} from '../../types/server/api/user.d'
import { addFileExtension, getFileExtension } from '../util/fileFormat'
import { MessageType } from '../../shared/util/messages'
import { MAX_FILE_UPLOAD_SIZE } from '../../shared/constants'

const { Public, Private } = FileVisibility

const router = Express.Router()

const s3 = container.get<S3Interface>(DependencyIds.s3)

const fileUploadMiddleware = fileUpload({
  limits: {
    fileSize: MAX_FILE_UPLOAD_SIZE, // 10MB
    files: 1,
  },
})

const validator = createValidator({ passError: true })

const urlRetrievalSchema = Joi.object({
  userId: Joi.number().required(),
})

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

const stateEditSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  state: Joi.string().allow(ACTIVE, INACTIVE).only().required(),
})

const ownershipTransferSchema = Joi.object({
  userId: Joi.number().required(),
  shortUrl: Joi.string().required(),
  newUserEmail: Joi.string().required(),
})

/**
 * Place incoming file into the request body so that it can be
 * validated together with the other fields by Joi.
 */
function preprocessPotentialIncomingFile(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  if (req.files) {
    req.body.files = req.files
  }
  next()
}

/**
 * Endpoint for a user to create a short URL. A short URL can either point to
 * a long URL, or a file provided by the user.
 *
 * In order to create a file URL, provide the `isFile` parameter set to `true`, and supply
 * the binary in a multipart/form-data under the field titled `file`. The longUrl
 * parameter in the request body must point to the s3 bucket with the correct key. For
 * example, a file upload request for the shortUrl named `test` should have `longUrl` set
 * to `https://file[-staging].go.gov.sg/test`.
 */
router.post(
  '/url',
  fileUploadMiddleware,
  preprocessPotentialIncomingFile,
  validator.body(urlSchema),
  async (req, res) => {
    const { userId, longUrl, shortUrl }: UrlCreationRequest = req.body
    const file = req.files?.file

    if (Array.isArray(file)) {
      res.badRequest(jsonMessage('Only single file uploads are supported.'))
      return
    }

    try {
      const user = await User.findByPk(userId)
      const fileKey = file
        ? addFileExtension(shortUrl, getFileExtension(file.name))
        : ''

      if (!user) {
        res.notFound(jsonMessage('User not found'))
        return
      }

      const existsShortUrl = await Url.findOne({ where: { shortUrl } })
      if (existsShortUrl) {
        res.badRequest(
          jsonMessage(
            `Short link "${shortUrl}" already exists`,
            MessageType.ShortUrlError,
          ),
        )
        return
      }

      // Success
      const result = await transaction(async (t) => {
        const url = Url.create(
          {
            userId: user.id,
            longUrl: file ? s3.buildFileLongUrl(fileKey) : longUrl,
            shortUrl,
            isFile: !!file,
          },
          { transaction: t },
        )
        if (file) {
          await s3.uploadFileToS3(file.data, fileKey, file.mimetype)
        }
        return url
      })

      res.ok(result)
    } catch (error) {
      logger.error(`Error creating short URL:\t${error}`)
      res.badRequest(jsonMessage('Server error.'))
    }
  },
)

router.patch(
  '/url/ownership',
  validator.body(ownershipTransferSchema),
  async (req, res) => {
    const {
      userId,
      shortUrl,
      newUserEmail,
    }: OwnershipTransferRequest = req.body
    try {
      // Test current user really owns the shortlink
      const user = await User.scope({
        method: ['includeShortUrl', shortUrl],
      }).findOne({
        where: { id: userId },
      })

      if (!user) {
        res.notFound(jsonMessage('User not found.'))
        return
      }

      const [url] = (user.get() as UserType).Urls

      if (!url) {
        res.notFound(
          jsonMessage(`Short link "${shortUrl}" not found for user.`),
        )
      }

      // Check that the new user exists
      const newUser = await User.findOne({
        where: { email: newUserEmail.toLowerCase() },
      })

      if (!newUser) {
        res.notFound(jsonMessage('User not found.'))
        return
      }
      const newUserId = (newUser.get() as UserType).id

      // Do nothing if it is the same user
      if (userId === newUserId) {
        res.badRequest(jsonMessage('You already own this link.'))
        return
      }

      // Success
      const result = await transaction((t) =>
        url.update({ userId: newUserId }, { transaction: t }),
      )
      res.ok(result)
    } catch (error) {
      logger.error(`Error transferring ownership of short URL:\t${error}`)
      res.badRequest(jsonMessage('An error has occured'))
    }
  },
)

/**
 * Endpoint for user to edit a file or a longUrl.
 *
 * If editing a file link, only the file can be changed and not
 * the long URL. This is to ensure a one-to-one mapping between
 * the short URL and S3 object key.
 */
router.patch(
  '/url/edit',
  fileUploadMiddleware,
  preprocessPotentialIncomingFile,
  validator.body(urlSchema),
  async (req, res) => {
    const { userId, longUrl, shortUrl }: UrlEditRequest = req.body
    const file = req.files?.file
    if (Array.isArray(file)) {
      res.badRequest(jsonMessage('Only single file uploads are supported.'))
      return
    }

    try {
      const user = await User.scope({
        method: ['includeShortUrl', shortUrl],
      }).findOne({
        where: { id: userId },
      })

      if (!user) {
        res.notFound(jsonMessage('User not found.'))
        return
      }

      const [url] = (user.get() as UserType).Urls

      if (!url) {
        res.notFound(
          jsonMessage(`Short link "${shortUrl}" not found for user.`),
        )
      }

      await transaction(async (t) => {
        if (!url.isFile) {
          await url.update({ longUrl }, { transaction: t })
        } else if (file) {
          const oldKey = s3.getKeyFromLongUrl(url.longUrl)
          const newKey = addFileExtension(shortUrl, getFileExtension(file.name))
          await url.update(
            { longUrl: s3.buildFileLongUrl(newKey) },
            { transaction: t },
          )
          await s3.setS3ObjectACL(oldKey, Private)
          await s3.uploadFileToS3(file.data, newKey, file.mimetype)
        }
      })
      res.ok(jsonMessage(`Short link "${shortUrl}" has been updated`))

      // Expire the Redis cache
      redirectClient.del(shortUrl, (err) => {
        if (err) {
          logger.error(`Short URL could not be purged from cache:\t${err}`)
        }
      })
    } catch (e) {
      logger.error(`Error editing long URL:\t${e}`)
      res.badRequest(jsonMessage('Invalid URL.'))
    }
  },
)

/**
 * Endpoint for user to render a URL active/inactive.
 */
router.patch('/url', validator.body(stateEditSchema), async (req, res) => {
  const { userId, shortUrl, state }: ShorturlStateEditRequest = req.body

  try {
    const user = await User.scope({
      method: ['includeShortUrl', shortUrl],
    }).findOne({
      where: { id: userId },
    })

    if (!user) {
      res.notFound(jsonMessage('User not found.'))
      return
    }

    const [url] = (user.get() as UserType).Urls

    if (!url) {
      res.notFound(jsonMessage(`Short link "${shortUrl}" not found for user.`))
    }

    await transaction(async (t) => {
      await url.update({ state }, { transaction: t })
      if (url.isFile) {
        // Toggle the ACL of the S3 object
        await s3.setS3ObjectACL(
          s3.getKeyFromLongUrl(url.longUrl),
          state === ACTIVE ? Public : Private,
        )
      }
    })
    res.ok()

    if (state === INACTIVE) {
      // Expire the Redis cache
      redirectClient.del(shortUrl, (err) => {
        if (err) {
          logger.error(`Short URL could not be purged from cache:\t${err}`)
        }
      })
    }
  } catch (error) {
    logger.error(`Error rendering URL active/inactive:\t${error}`)
    res.badRequest(
      jsonMessage(
        `Unable to set state to ${state} for short link "${shortUrl}"`,
      ),
    )
  }
})

/**
 * Endpoint for a user to retrieve their own URLs based on the query conditions.
 */
router.get('/url', validator.body(urlRetrievalSchema), async (req, res) => {
  const { userId } = req.body
  let { limit = 10000, searchText = '' } = req.query
  limit = Math.min(10000, limit)
  searchText = searchText.toLowerCase()
  const {
    offset = 0,
    orderBy = 'updatedAt',
    sortDirection = 'desc',
    isFile,
    state,
  } = req.query
  const queryConditions = {
    limit,
    offset,
    orderBy,
    sortDirection,
    searchText,
    userId,
    state,
    isFile,
  }

  try {
    // Find user and paginated urls
    const userCountAndArray = await User.scope({
      method: ['urlsWithQueryConditions', queryConditions],
    }).findAndCountAll({
      subQuery: false, // set limit and offset at end of main query instead of subquery
    })

    if (!userCountAndArray) {
      res.notFound(jsonMessage('User not found'))
      return
    }

    const { rows } = userCountAndArray
    let { count } = userCountAndArray
    const [userUrls] = rows

    if (!userUrls) {
      res.notFound(jsonMessage('Urls not found'))
      return
    }

    const urls = (userUrls.get() as UserType).Urls
    // count will always be >= 1 due to left outer join on user and url tables
    // to handle edge case where count === 1 but user does not have any urls
    if (urls.length === 0) {
      count = 0
    }

    res.ok({ urls, count })
  } catch (error) {
    res.serverError(jsonMessage('Error retrieving URLs for user'))
  }
})

export = router
