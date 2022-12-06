import { StatsD } from 'hot-shots'
import { DEV_ENV } from '../config'

export const MALICIOUS_ACTIVITY_FILE = 'malicious_activity.file'
export const MALICIOUS_ACTIVITY_LINK = 'malicious_activity.link'
export const OTP_GENERATE_FAILURE = 'otp.generate.failure'
export const OTP_GENERATE_SUCCESS = 'otp.generate.success'
export const OTP_VERIFY_FAILURE = 'otp.verify.failure'
export const OTP_VERIFY_SUCCESS = 'otp.verify.success'
export const SEARCH_USER_URL = 'search.user.url'
export const SEARCH_USER_URL_TAG_IS_TAG = 'istag'
export const SHORTLINK_CLICKS = 'shortlink.clicks'
export const SHORTLINK_CREATE = 'shortlink.create'
export const SHORTLINK_CREATE_TAG_IS_FILE = 'isfile'
export const SHORTLINK_CREATE_TAG_SOURCE = 'source'
export const USER_NEW = 'user.new'

const dogstatsd = new StatsD({
  prefix: 'go.',
  mock: DEV_ENV,
})

export default dogstatsd
