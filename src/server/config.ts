import nodemailer from 'nodemailer'
import winston, { createLogger, format, transports } from 'winston'
import minimatch from 'minimatch'
import { parse } from 'url'
import generateOTP, { OtpFunction } from './util/otp'

// Check environment
export const DEV_ENV: boolean = process.env.NODE_ENV === 'development'

// Constants for export
// For bcrypt hash
const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10
// in seconds, for OTP password expiry
const OTP_EXPIRY: number = Number(process.env.OTP_EXPIRY) || 5 * 60
// in seconds, for URL cache expiry
const REDIRECT_EXPIRY: number = Number(process.env.REDIRECT_EXPIRY) || 5 * 60
// in seconds, for statistics cache expiry
const STATISTICS_EXPIRY: number =
  Number(process.env.STATISTICS_EXPIRY) || 5 * 60

// Compulsory environment variables required for booting up
const requiredVars: string[] = [
  // 'DB_URI', // Main SQL database used with Sequelize
  // 'OG_URL', // Origin Url
  // 'REDIS_OTP_URI', // Cache for storing OTP hashes
  // 'REDIS_SESSION_URI', // Cache for storing session info
  // 'REDIS_REDIRECT_URI', // Cache for short links
  // 'REDIS_STAT_URI', // Cache for statistics (user, link, and click counts)
  // 'SESSION_SECRET',
  // 'VALID_EMAIL_GLOB_EXPRESSION', // Glob pattern for valid emails
  // 'AWS_S3_BUCKET', // For file.go.gov.sg uploads
]

// AWS Simple Email Service
const sesVars: string[] = ['SES_HOST', 'SES_USER', 'SES_PASS', 'SES_PORT']

// Winston for generic logging
export const logger: winston.Logger = createLogger({
  // change level if in dev environment versus production
  level: DEV_ENV ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
  ],
})

const exitIfAnyMissing = (vars: string[]) => {
  const err = vars.reduce((res, e) => {
    if (!process.env[e]) res.push(e)
    return res
  }, [] as string[])
  if (err.length > 0) {
    logger.error(
      `ERROR: Cannot deploy app. These environment variables are missing\t: ${err.join(
        ', ',
      )}`,
    )
    process.exit(1)
  }
}

// Exit if any required env var are missing
exitIfAnyMissing(requiredVars)

// From here, all required env variables will be casted to non-nullable strings.

let otpFunction: OtpFunction | null = null
let transporterOpts: nodemailer.TransporterOptions | null = null
let proxy: boolean = true
let cookieConfig: CookieSettings | null = null

if (DEV_ENV) {
  // Only configure things particular to development here
  logger.warn('Deploying in development mode.')
  otpFunction = () => '111111'
  cookieConfig = {
    secure: false, // do not set domain for localhost
    maxAge: 1800000, // milliseconds = 30 min
  }
  proxy = false
} else {
  logger.info('Deploying in production mode.')
  otpFunction = generateOTP
  const maxAge = Number(process.env.COOKIE_MAX_AGE)
  cookieConfig = {
    secure: true,
    maxAge: Number.isNaN(maxAge) ? 1800000 : maxAge,
  }
  exitIfAnyMissing(sesVars)
  // All session variables will now be casted to non-nullable strings
  transporterOpts = {
    host: process.env.SES_HOST as string,
    auth: {
      user: process.env.SES_USER as string,
      pass: process.env.SES_PASS as string,
    },
    port: process.env.SES_PORT as string,
    pool: true,
    maxMessages: 100,
    maxConnections: 20,
  }
}

export interface CookieSettings {
  secure: boolean
  maxAge: number
}

export interface SessionSettings {
  name: string
  secret: string
}

export const validEmailDomainGlobExpression = process.env
  .VALID_EMAIL_GLOB_EXPRESSION as string
export const emailValidator = new minimatch.Minimatch(
  validEmailDomainGlobExpression,
  {
    noext: true,
    noglobstar: true,
    nobrace: true,
    nonegate: true,
  },
)
export const loginMessage = process.env.LOGIN_MESSAGE
export const userMessage = process.env.USER_MESSAGE
export const s3Bucket = process.env.AWS_S3_BUCKET as string
export const linksToRotate = process.env.ROTATED_LINKS

export const databaseUri = process.env.DB_URI as string
export const redisOtpUri = process.env.REDIS_OTP_URI as string
export const redisSessionUri = process.env.REDIS_SESSION_URI as string
export const redisRedirectUri = process.env.REDIS_REDIRECT_URI as string
export const redisStatUri = process.env.REDIS_STAT_URI as string
export const getOTP: OtpFunction = otpFunction
export const transporterOptions: nodemailer.TransporterOptions | null = transporterOpts
export const trustProxy: boolean = proxy
export const cookieSettings: CookieSettings = cookieConfig
export const cookieSessionMaxSizeBytes =
  Number(process.env.COOKIE_SESSION_MAX_SIZE_BYTES) || 2000
export const ogUrl = process.env.OG_URL as string
export const ogHostname = parse(ogUrl).hostname
export const gaTrackingId: string | undefined = process.env.GA_TRACKING_ID
export const saltRounds = SALT_ROUNDS
export const otpExpiry = OTP_EXPIRY
export const redirectExpiry = REDIRECT_EXPIRY
export const statisticsExpiry = STATISTICS_EXPIRY
export const sessionSettings: SessionSettings = {
  secret: process.env.SESSION_SECRET as string,
  name: 'gogovsg',
}

export const virusTotalKey: string | undefined = process.env.VIRUS_TOTAL_KEY

// LocalStack variables.
export const bucketEndpoint =
  process.env.BUCKET_ENDPOINT || 'http://localstack:4566'
export const accessEndpoint =
  process.env.ACCESS_ENDPOINT || 'http://localhost:4566'

export const dbPoolSize = Number(process.env.DB_POOL_SIZE) || 40

export const sentryDns: string | undefined = process.env.SENTRY_DNS

// Search variables
export const searchShortUrlWeight =
  Number(process.env.SEARCH_SHORT_URL_WEIGHT) || 1.0
export const searchDescriptionWeight =
  Number(process.env.SEARCH_DESCRIPTION_WEIGHT) || 0.4
