import { createClient } from 'redis'
import {
  logger,
  redisOtpUri,
  redisRedirectUri,
  redisSafeBrowsingUri,
  redisSessionUri,
  redisStatUri,
} from './config.js'

// redis@6's createClient parses `username`/`password` out of the url
// string itself and sends AUTH during the handshake, so passing the url
// alone is sufficient for authentication (unlike redis@3).
// With AWS ElastiCache, authentication is provided only
// with encryption-in-transit, so TLS options must also
// be provided.
//
// redis@6's createClient derives `socket.tls` from a `rediss://` URL
// scheme automatically, so a `rediss://` value in the REDIS_*_URI env
// vars still enables TLS with no extra options here.
//
// RESP: 2 is pinned because redis@6 defaults to RESP3, which sends a
// `HELLO 3` handshake command that Redis < 6 (docker-compose pins
// redis:5.0.3-alpine) rejects with "ERR unknown command `HELLO`",
// causing a permanent reconnect loop.

function createAndConnect(
  url: string,
  errorName: string,
  connectedMessage: string,
) {
  const client = createClient({ url, RESP: 2 })
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
