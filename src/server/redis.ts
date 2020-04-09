import redis from 'redis'
import {
  logger,
  redisOtpUri,
  redisRedirectUri,
  redisSessionUri,
  redisStatUri,
} from './config'

// Note: It is insufficient for authentication to
// set the password in the url string - this must be
// set explicitly by providing the `password` property,
// or by calling redisClient.auth(<password>).
// With AWS ElastiCache, authentication is provided only
// with encryption-in-transit, so TLS options must also
// be provided.

// For storing OTPs
export const otpClient = redis
  .createClient({
    url: redisOtpUri,
  })
  .on('connect', () => {
    logger.info('otpClient connected')
  })
  .on('error', (error) => {
    logger.error(`otpClient error:${error}`)
  })

// For user sessions
export const sessionClient = redis
  .createClient({
    url: redisSessionUri,
  })
  .on('connect', () => {
    logger.info('sessionClient client connected')
  })
  .on('error', (error) => {
    logger.error(`sessionClient error:${error}`)
  })

// For caching short URLs
export const redirectClient = redis
  .createClient({
    url: redisRedirectUri,
  })
  .on('connect', () => {
    logger.info('redirectClient client connected')
  })
  .on('error', (error) => {
    logger.error(`redirectClient error:${error}`)
  })

// For storing computed statistics
export const statClient = redis
  .createClient({
    url: redisStatUri,
  })
  .on('connect', () => {
    logger.info('statClient client connected')
  })
  .on('error', (error) => {
    logger.error(`statClient error:${error}`)
  })
