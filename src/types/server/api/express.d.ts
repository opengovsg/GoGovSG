import { RedisStore } from 'connect-redis'

declare global {
  namespace Express {
    interface Request {
      sessionStore: RedisStore
    }

    interface Response {
      ok(content?: Buffer | object | string): void
      created(content?: Buffer | object | string): void
      badRequest(content?: Buffer | object | string): void
      unauthorized(content?: Buffer | object | string): void
      forbidden(content?: Buffer | object | string): void
      notFound(content?: Buffer | object | string): void
      unsupportedMediaType(content?: Buffer | object | string): void
      unprocessableEntity(content?: Buffer | object | string): void
      serverError(content?: Buffer | object | string): void
    }
  }
}
