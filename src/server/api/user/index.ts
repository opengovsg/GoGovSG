import Express from 'express'
import fileUpload from 'express-fileupload'
import { createValidator } from 'express-joi-validation'
import jsonMessage from '../../util/json'
import { logger } from '../../config'
import { DependencyIds } from '../../constants'
import { container } from '../../util/inversify'
import {
  OldUrlEditRequest,
  OwnershipTransferRequest,
  UrlCreationRequest,
  UrlEditRequest,
} from '../../../types/server/api/user.d'
import { addFileExtension, getFileExtension } from '../../util/fileFormat'
import { MessageType } from '../../../shared/util/messages'
import { MAX_FILE_UPLOAD_SIZE } from '../../../shared/constants'
import { UrlRepositoryInterface } from '../../repositories/interfaces/UrlRepositoryInterface'
import { StorableFile } from '../../repositories/types'
import { UserRepositoryInterface } from '../../repositories/interfaces/UserRepositoryInterface'
import { NotFoundError } from '../../util/error'
import {
  ownershipTransferSchema,
  urlEditSchema,
  urlRetrievalSchema,
  urlSchema,
} from './validators'

const router = Express.Router()

const urlRepository = container.get<UrlRepositoryInterface>(
  DependencyIds.urlRepository,
)
const userRepository = container.get<UserRepositoryInterface>(
  DependencyIds.userRepository,
)

const fileUploadMiddleware = fileUpload({
  limits: {
    fileSize: MAX_FILE_UPLOAD_SIZE, // 10MB
    files: 1,
  },
})

const validator = createValidator({ passError: true })

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
      const user = await userRepository.findById(userId)

      if (!user) {
        res.notFound(jsonMessage('User not found'))
        return
      }

      const existsShortUrl = await urlRepository.findByShortUrl(shortUrl)
      if (existsShortUrl) {
        res.badRequest(
          jsonMessage(
            `Short link "${shortUrl}" already exists`,
            MessageType.ShortUrlError,
          ),
        )
        return
      }

      const storableFile: StorableFile | undefined = file
        ? {
            data: file.data,
            key: addFileExtension(shortUrl, getFileExtension(file.name)),
            mimetype: file.mimetype,
          }
        : undefined

      // Success
      const result = await urlRepository.create(
        {
          userId: user.id,
          longUrl,
          shortUrl,
        },
        storableFile,
      )

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
      const url = await userRepository.findOneUrlForUser(userId, shortUrl)

      if (!url) {
        res.notFound(
          jsonMessage(`Short link "${shortUrl}" not found for user.`),
        )
        return
      }

      // Check that the new user exists
      const newUser = await userRepository.findByEmail(
        newUserEmail.toLowerCase(),
      )

      if (!newUser) {
        res.notFound(jsonMessage('User not found.'))
        return
      }
      const newUserId = newUser.id

      // Do nothing if it is the same user
      if (userId === newUserId) {
        res.badRequest(jsonMessage('You already own this link.'))
        return
      }

      // Success
      const result = await urlRepository.update(url, {
        userId: newUserId,
      })
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
    const { userId, longUrl, shortUrl }: OldUrlEditRequest = req.body
    const file = req.files?.file
    if (Array.isArray(file)) {
      res.badRequest(jsonMessage('Only single file uploads are supported.'))
      return
    }

    try {
      const url = await userRepository.findOneUrlForUser(userId, shortUrl)

      if (!url) {
        res.notFound(
          jsonMessage(`Short link "${shortUrl}" not found for user.`),
        )
        return
      }

      const storableFile: StorableFile | undefined = file
        ? {
            data: file.data,
            key: addFileExtension(shortUrl, getFileExtension(file.name)),
            mimetype: file.mimetype,
          }
        : undefined

      await urlRepository.update(url, { longUrl }, storableFile)

      res.ok(jsonMessage(`Short link "${shortUrl}" has been updated`))
    } catch (e) {
      logger.error(`Error editing long URL:\t${e}`)
      res.badRequest(jsonMessage('Invalid URL.'))
    }
  },
)

/**
 * Endpoint for user to make edits to their link.
 */
router.patch(
  '/url',
  preprocessPotentialIncomingFile,
  validator.body(urlEditSchema),
  async (req, res) => {
    const { userId, longUrl, shortUrl, state }: UrlEditRequest = req.body
    const file = req.files?.file
    if (Array.isArray(file)) {
      res.badRequest(jsonMessage('Only single file uploads are supported.'))
      return
    }

    try {
      const url = await userRepository.findOneUrlForUser(userId, shortUrl)

      if (!url) {
        res.notFound(
          jsonMessage(`Short link "${shortUrl}" not found for user.`),
        )
        return
      }

      const storableFile: StorableFile | undefined = file
        ? {
            data: file.data,
            key: addFileExtension(shortUrl, getFileExtension(file.name)),
            mimetype: file.mimetype,
          }
        : undefined

      await urlRepository.update(url, { longUrl, state }, storableFile)
      res.ok()
    } catch (error) {
      logger.error(`Error editing URL:\t${error}`)
      res.badRequest(jsonMessage(`Unable to edit short link "${shortUrl}"`))
    }
  },
)

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
  // Find user and paginated urls
  try {
    const { urls, count } = await userRepository.findUrlsForUser(
      queryConditions,
    )
    res.ok({ urls, count })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.notFound(error.message)
    } else {
      res.serverError(jsonMessage('Error retrieving URLs for user'))
    }
  }
})

export = router
