import connectRedis = require('connect-redis')

declare global {
  namespace Express {
    interface Request {
      sessionStore: connectRedis.RedisStore
    }

    interface Response {
      json: (obj: object) => void
    }
  }
}
