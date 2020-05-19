import Express from 'express'
import jsonMessage from '../util/json'
import { User, UserType } from '../models/user'
import { Url } from '../models/url'
import { ACTIVE, INACTIVE } from '../models/types'
import { redirectClient } from '../redis'
import blacklist from '../resources/blacklist'
import { isHttps, isValidShortUrl } from '../../shared/util/validation'
import {
  FileVisibility,
  setS3ObjectACL,
  uploadFileToS3,
} from '../util/aws'
import { transaction } from '../util/sequelize'
import { logger } from '../config'

const { Public, Private } = FileVisibility

const router = Express.Router()

/**
 * Make sure all parameters needed for user URL retrieval API are present.
 */
function validateUrlRetrieval(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const { userId } = req.body

  if (!userId) {
    res.badRequest(
      jsonMessage('Some or all required arguments missing: userId'),
    )
  }

  next()
}

/**
 * Make sure all parameters needed for the URL creation/edit API are present.
 */
function validateUrls(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const { userId, longUrl, shortUrl, isFile } = req.body

  if (!(userId && longUrl && shortUrl)) {
    res.badRequest(
      jsonMessage(
        'Some or all of required arguments are missing: userId, longUrl, shortUrl',
      ),
    )
    return
  }

  // Test for https
  if (!isHttps(longUrl)) {
    res.badRequest(jsonMessage('URL must start with https://'))
    return
  }

  // Test for malformed short link
  if (!isValidShortUrl(shortUrl)) {
    res.badRequest(
      jsonMessage(
        'Short links should only consist of lowercase letters, numbers and hyphens.',
      ),
    )
    return
  }

  // Do not allow URLs to blacklisted sites
  if (blacklist.some((bl) => longUrl.includes(bl))) {
    res.badRequest(
      jsonMessage('Creation of URLs to link shortener sites prohibited.'),
    )
    return
  }

  // An upload request must contain a file
  if (isFile && !req.files?.file) {
    res.badRequest(jsonMessage('Missing file to upload.'))
    return
  }

  next()
}

/**
 * Make sure all parameters needed for the URL state toggling API are present.
 */
function validateState(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const { userId, shortUrl, state } = req.body

  if (!(userId && shortUrl && state)) {
    res.badRequest(
      jsonMessage(
        'Some or all required arguments are missing: userId, shortUrl, state.',
      ),
    )
    return
  }

  if (![ACTIVE, INACTIVE].includes(state)) {
    res.badRequest(
      jsonMessage(`state parameter must be one of {${ACTIVE}, ${INACTIVE}}.`),
    )
  }

  next()
}

/**
 * Endpoint for a user to create a short URL.
 */
router.post('/url', validateUrls, async (req, res) => {
  const { isFile, userId, longUrl, shortUrl } = req.body
  // @ts-ignore Type definition does not know about the compulsory file field.
  const { file } = req.files

  try {
    const user = await User.findByPk(userId)

    if (!user) {
      res.notFound(jsonMessage('User not found'))
      return
    }

    const existsShortUrl = await Url.findOne({ where: { shortUrl } })
    if (existsShortUrl) {
      res.badRequest(jsonMessage(`Short link "${shortUrl}" already exists`))
      return
    }

    // Success
    const result = await transaction(async (t) => {
      const url = Url.create(
        {
          userId: user.id,
          longUrl,
          shortUrl,
          isFile: !!isFile,
        },
        { transaction: t },
      )
      if (isFile) {
        await uploadFileToS3(file.data, shortUrl)
      }
      return url
    })

    res.ok(result)
  } catch (error) {
    logger.error(`Error creating short URL:\t${error}`)
    res.badRequest(jsonMessage('Invalid URL.'))
  }
})

router.patch('/url/ownership', async (req, res) => {
  const { userId, shortUrl, newUserEmail } = req.body
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
      res.notFound(jsonMessage(`Short link "${shortUrl}" not found for user.`))
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
})

/**
 * Endpoint for user to edit a longUrl.
 */
router.patch('/url/edit', validateUrls, async (req, res) => {
  const { userId, longUrl, shortUrl } = req.body
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

    await transaction((t) => url.update({ longUrl }, { transaction: t }))
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
})

/**
 * Endpoint for user to render a URL active/inactive.
 */
router.patch('/url', validateState, async (req, res) => {
  const { userId, shortUrl, state } = req.body

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
        await setS3ObjectACL(url.shortUrl, state === ACTIVE ? Public : Private)
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
router.get('/url', validateUrlRetrieval, async (req, res) => {
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
