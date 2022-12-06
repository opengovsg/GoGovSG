import { StatsD } from 'hot-shots'
import { DEV_ENV } from '../config'

export const API_KEY_GENERATE = 'apikey.generate'
export const API_KEY_GENERATE_TAG_IS_NEW = 'isnew'
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

export const JOB_START_SUCCESS = 'job.start.success'
export const JOB_START_FAILURE = 'job.start.failure'
export const JOB_ITEM_UPDATE_SUCCESS = 'jobItem.update.success'
export const JOB_ITEM_UPDATE_FAILURE = 'jobItem.update.failure'
export const JOB_UPDATE_SUCCESS = 'job.update.success'
export const JOB_UPDATE_FAILURE = 'job.update.failure'
export const JOB_EMAIL_SUCCESS = 'job.email.success'
export const JOB_EMAIL_FAILURE = 'job.email.failure'

const dogstatsd = new StatsD({
  prefix: 'go.',
  mock: DEV_ENV,
})

export default dogstatsd
