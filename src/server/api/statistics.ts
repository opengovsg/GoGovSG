import Express from 'express'
import { statClient } from '../redis'
import { logger, statisticsExpiry } from '../config'
import { DependencyIds } from '../constants'
import { container } from '../util/inversify'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'

const router = Express.Router()
const urlRepository = container.get<UrlRepositoryInterface>(
  DependencyIds.urlRepository,
)
const userRepository = container.get<UserRepositoryInterface>(
  DependencyIds.userRepository,
)

/**
 * Endpoint to retrieve total user, link, and click counts.
 */
router.get('/', async (_: Express.Request, res: Express.Response) => {
  // Check if cache contains value
  statClient.mget(
    ['userCount', 'linkCount', 'clickCount'],
    async (cacheError, results: Array<string | null>) => {
      if (cacheError) {
        // log and fallback to database
        logger.error(
          `Access to statistics cache failed unexpectedly:\t${cacheError}`,
        )
      }

      // Since the expiry in Redis of the values are the same,
      // all 3 should be present (or absent) from Redis together
      // If the data is not in Redis, results will be [null, null, null]
      if (!cacheError && !results.includes(null)) {
        // Turn each value into an integer
        const [userCount, linkCount, clickCount] = results.map((x) => Number(x))

        res.json({ userCount, linkCount, clickCount })
        return
      }

      // If the values are not found in the cache, we read from the DB
      const [userCount, linkCount, clickCountUntrusted] = await Promise.all([
        userRepository.getNumUsers(),
        urlRepository.getNumUrls(),
        urlRepository.getTotalLinkClicks(),
      ])

      // Cater to the edge case where clickCount is NaN because there are no links
      const clickCount = Number.isNaN(clickCountUntrusted)
        ? 0
        : clickCountUntrusted

      res.json({ userCount, linkCount, clickCount })

      // Store values into Redis
      const callback = (err: Error | null) => {
        if (err) {
          logger.error(`Cache write failed:\t${err}`)
        }
      }
      statClient.set(
        'userCount',
        `${userCount}`,
        'EX',
        statisticsExpiry,
        callback,
      )
      statClient.set(
        'linkCount',
        `${linkCount}`,
        'EX',
        statisticsExpiry,
        callback,
      )
      statClient.set(
        'clickCount',
        `${clickCount}`,
        'EX',
        statisticsExpiry,
        callback,
      )
    },
  )
})

export = router
