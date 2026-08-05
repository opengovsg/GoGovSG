import { DB_URI } from './config'

/**
 * Env vars required by src/server/config.ts when integration tests bootstrap
 * the app schema on the CI host (outside docker-compose's app container).
 */
export default function setIntegrationServerEnv(): void {
  process.env.NODE_ENV = 'development'
  process.env.DB_URI = DB_URI
  process.env.REPLICA_URI = DB_URI
  process.env.REDIS_OTP_URI = 'redis://localhost:6379/0'
  process.env.REDIS_SESSION_URI = 'redis://localhost:6379/1'
  process.env.REDIS_REDIRECT_URI = 'redis://localhost:6379/2'
  process.env.REDIS_STAT_URI = 'redis://localhost:6379/3'
  process.env.REDIS_SAFE_BROWSING_URI = 'redis://localhost:6379/4'
  process.env.SESSION_SECRET = 'thiscouldbeanything'
  process.env.OG_URL = 'https://go.gov.sg'
  process.env.VALID_EMAIL_GLOB_EXPRESSION = '*.gov.sg'
  process.env.AWS_S3_BUCKET = 'local-bucket'
  process.env.API_KEY_SALT = '$2b$10$9rBKuE4Gb5ravnvP4xjoPu'
  process.env.SES_HOST = 'localhost'
  process.env.SES_PORT = '1080'
  process.env.ASSET_VARIANT = 'gov'
}