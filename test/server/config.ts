import { createLogger, format, transports } from 'winston'
import minimatch from 'minimatch'

// Winston for generic logging
export const logger = createLogger({
  // change level if in dev environment versus production
  level: 'info',
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

export const redirectExpiry = 60

jest.mock('../../src/server/config', () => ({
  DEV_ENV: false,
  emailValidator: new minimatch.Minimatch('*.test.sg', {
    noext: true,
    noglobstar: true,
    nobrace: true,
    nonegate: true,
  }),
  getOTP: () => '1',
  logger,
  loginMessage: 'login message',
  saltRounds: '',
  validEmailDomainGlobExpression: '*.test.sg',
  redirectExpiry,
  otpExpiry: 10,
  s3Bucket: 'file-staging.go.gov.sg',
  linksToRotate: 'testlink1,testlink2,testlink3',
  sentryDns: 'mocksentry.com',
  searchShortUrlWeight: 1,
  searchDescriptionWeight: 0.4,
}))
