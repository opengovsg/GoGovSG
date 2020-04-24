import Express from 'express'
import jsonMessage from '../util/json'
import {
  Url,
  User,
  UserType,
  sequelize,
} from '../models'
import { ACTIVE, INACTIVE } from '../models/types'
import { logger } from '../config'
import { redirectClient } from '../redis'
import blacklist from '../resources/blacklist'
import { isHttps, isValidShortUrl } from '../../shared/util/validation'
import { generatePresignedUrl } from '../util/aws'

const router = Express.Router()

/**
 * Make sure all parameters needed for user URL retrieval API are present.
 */
function validateUrlRetrieval(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  const { userId } = req.body

  if (!userId) {
    res.badRequest(
      jsonMessage(
        'Some or all required arguments missing: userId'
      )
    )
  }

  next()
}

/**
 * Make sure all parameters needed for the URL creation/edit API are present.
 */
function validateUrls(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const { userId, longUrl, shortUrl } = req.body

  if (!(userId && longUrl && shortUrl)) {
    res.badRequest(
      jsonMessage(
        'Some or all of required arguments are missing: userId, longUrl, shortUrl'
      )
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
        'Short links should only consist of lowercase letters, numbers and hyphens.'
      )
    )
    return
  }

  // Do not allow URLs to blacklisted sites
  if (blacklist.some(bl => longUrl.includes(bl))) {
    res.badRequest(
      jsonMessage('Creation of URLs to link shortener sites prohibited.')
    )
    return
  }

  next()
}

/**
 * Make sure all parameters needed for the URL state toggling API are present.
 */
function validateState(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const {
    userId, shortUrl, state,
  } = req.body

  if (!(userId && shortUrl && state)) {
    res.badRequest(
      jsonMessage(
        'Some or all required arguments are missing: userId, shortUrl, state.'
      )
    )
    return
  }

  if (![ACTIVE, INACTIVE].includes(state)) {
    res.badRequest(
      jsonMessage(
        `state parameter must be one of {${ACTIVE}, ${INACTIVE}}.`
      )
    )
  }

  next()
}

/**
 * Make sure all parameters needed for the pre-signed url request are present.
 *
 * @param {string} fileType - File type of the file that is being uploaded.
 * This must be declared here so that subsequent PUT requests to the pre-signed URL
 * will pass header checks.
 * @param {string} key - Name of the entry to be inserted to the S3 bucket. Ensure
 * that the key does not collide with other files before declaring it here. Otherwise,
 * it will cause an existing file of the same key to be overridden.
 */
function validatePresignedUrlRequest(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  if (!req.body.fileType || !req.body.key) {
    return res.badRequest(
      jsonMessage('Some or all required arguments are missing: fileType, key.')
    )
  }
  return next()
}

/**
 * Endpoint for a user to create a short URL.
 */
router.post('/url', validateUrls, async (req, res) => {
  const { userId, longUrl, shortUrl } = req.body

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
    const result = await sequelize.transaction(t => (
      Url.create(
        { userId: user.id, longUrl, shortUrl },
        { transaction: t }
      )
    ))

    res.ok(result)
  } catch (error) {
    logger.error(`Error creating short URL:\t${error}`)
    res.badRequest(jsonMessage('Invalid URL.'))
  }
})

/**
 * Creates a pre-signed link.
 */
router.post('/upload', validatePresignedUrlRequest, async (req, res) => {
  const { fileType, key } = req.body
  try {
    const url = await generatePresignedUrl(key, fileType)
    return res.created({ url })
  } catch (error) {
    logger.error(`Error creating pre-signed url: \t${error}`)
    return res.serverError('Could not generate pre-signed url.')
  }
})

router.patch('/url/ownership', async (req, res) => {
  const { userId, shortUrl, newUserEmail } = req.body
  try {
    // Test current user really owns the shortlink
    const user = await User.scope({ method: ['includeShortUrl', shortUrl] }).findOne({
      where: { id: userId },
    })

    if (!user) {
      res.notFound(jsonMessage('User not found.'))
      return
    }

    const [url] = (user.get() as UserType).Urls

    if (!url) {
      res.notFound(
        jsonMessage(`Short link "${shortUrl}" not found for user.`)
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
    const result = await sequelize.transaction(t => (
      url.update(
        { userId: newUserId },
        { transaction: t }
      )
    ))
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
    const user = await User.scope({ method: ['includeShortUrl', shortUrl] }).findOne({
      where: { id: userId },
    })

    if (!user) {
      res.notFound(jsonMessage('User not found.'))
      return
    }

    const [url] = (user.get() as UserType).Urls

    if (!url) {
      res.notFound(
        jsonMessage(`Short link "${shortUrl}" not found for user.`)
      )
    }

    await sequelize.transaction(t => (
      url.update(
        { longUrl },
        { transaction: t }
      )
    ))
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
    const user = await User.scope({ method: ['includeShortUrl', shortUrl] }).findOne({
      where: { id: userId },
    })

    if (!user) {
      res.notFound(jsonMessage('User not found.'))
      return
    }

    const [url] = (user.get() as UserType).Urls

    if (!url) {
      res.notFound(
        jsonMessage(`Short link "${shortUrl}" not found for user.`)
      )
    }

    await sequelize.transaction(t => (
      url.update({ state }, { transaction: t })
    ))
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
        `Unable to set state to ${state} for short link "${shortUrl}"`
      )
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
  const { offset = 0, orderBy = 'updatedAt', sortDirection = 'desc' } = req.query
  const queryConditions = {
    limit, offset, orderBy, sortDirection, searchText, userId,
  }

  try {
    // Find user and paginated urls
    const userCountAndArray = await User.scope({ method: ['urlsWithQueryConditions', queryConditions] }).findAndCountAll({
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
