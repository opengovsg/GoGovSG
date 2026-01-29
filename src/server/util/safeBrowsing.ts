import { DEFAULT_URL_SCAN_RESULT_EXPIRY_SECONDS } from '../../shared/constants'

interface GetSafeBrowsingExpiryDateParams {
  longUrl: string
}

// eslint-disable-next-line import/prefer-default-export
export const getSafeBrowsingExpiryDate = (
  _: GetSafeBrowsingExpiryDateParams,
) => {
  // TODO: Consider having a table of whitelisted URLs that are known to
  // be safe, which can have a longer expiry time.
  const expiry = new Date()
  expiry.setSeconds(
    expiry.getSeconds() + DEFAULT_URL_SCAN_RESULT_EXPIRY_SECONDS,
  )

  return expiry
}
