import { createClient } from 'redis'
import {
  logger,
  redisOtpUri,
  redisRedirectUri,
  redisSafeBrowsingUri,
  redisSessionUri,
  redisStatUri,
} from './config.js'

// Note: It is insufficient for authentication to
// set the password in the url string - this must be
// set explicitly by providing the `password` property,
// or by calling redisClient.auth(<password>).
// With AWS ElastiCache, authentication is provided only
// with encryption-in-transit, so TLS options must also
// be provided.
//
// redis@6's createClient derives `socket.tls` from a `rediss://` URL
// scheme automatically, so a `rediss://` value in the REDIS_*_URI env
// vars still enables TLS with no extra options here.

function createAndConnect(
  url: string,
  errorName: string,
  connectedMessage: string,
) {
  const client = createClient({ url })
    .on('connect', () => {
      logger.info(connectedMessage)
    })
    .on('error', (error) => {
      logger.error(`${errorName} error:${error}`)
    })
  // redis@6 no longer connects implicitly on createClient(); the 'error'
  // listener above already logs connection failures, so this catch only
  // exists to prevent an unhandled promise rejection from crashing the
  // process.
  client.connect().catch(() => {})
  return client
}

// For storing OTPs
export const otpClient = createAndConnect(
  redisOtpUri,
  'otpClient',
  'otpClient connected',
)

// For user sessions
export const sessionClient = createAndConnect(
  redisSessionUri,
  'sessionClient',
  'sessionClient client connected',
)

// For caching short URLs
export const redirectClient = createAndConnect(
  redisRedirectUri,
  'redirectClient',
  'redirectClient client connected',
)

// For storing computed statistics
export const statClient = createAndConnect(
  redisStatUri,
  'statClient',
  'statClient client connected',
)

// For storing computed statistics
export const safeBrowsingClient = createAndConnect(
  redisSafeBrowsingUri,
  'safeBrowsingClient',
  'safeBrowsingClient client connected',
)
