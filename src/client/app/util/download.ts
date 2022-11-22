import { saveAs } from 'file-saver'
import * as Sentry from '@sentry/react'
import rootActions from '../components/pages/RootPage/actions'
import userActions from '../../user/actions'
import useIsIE from '../components/BaseLayout/util/ie'
import { GAEvent } from './ga'
import { UrlTableConfig } from '../../user/reducers/types'
import queryObjFromTableConfig from '../helpers/urlQueryHelper'

export const downloadUrls = async (tableConfig: UrlTableConfig) => {
  const urlsArr = []
  // set headers to csv
  urlsArr.push([
    'Short URL',
    'Original URL',
    'Status',
    'Tags',
    'Visits',
    'Created At',
    'Last Modified\n',
  ])
  const queryObj = queryObjFromTableConfig(tableConfig)
  await userActions.getUrls(queryObj).then((promise) => {
    // eslint-disable-next-line consistent-return
    const { json, isOk } = promise
    if (isOk) {
      const { urls } = json
      urls.forEach((url) => {
        const {
          shortUrl,
          longUrl,
          state,
          tagStrings,
          clicks,
          createdAt,
          updatedAt,
        } = url
        //  eslint-disable-next-line prefer-template
        urlsArr.push([
          shortUrl,
          longUrl,
          state,
          tagStrings,
          clicks,
          createdAt,
          `${updatedAt}\n`,
        ])
      })
    } else if (!isOk && json) {
      // Sentry analytics: download links fail
      Sentry.captureMessage('download links unsuccessful')
      GAEvent('user page', 'download links', 'unsuccessful')

      rootActions.setErrorMessage(json.message || '')
      return null
    } else {
      // Sentry analytics: download links fail
      Sentry.captureMessage('download links unsuccessful')
      GAEvent('user page', 'download links', 'unsuccessful')

      rootActions.setErrorMessage('Error downloading urls.')
      return null
    }
    return null
  })

  const blob = new Blob([urlsArr.join('')], {
    type: 'text/csv;charset=utf-8',
  })

  if (useIsIE()) {
    navigator.msSaveBlob(blob, 'urls.csv')
  } else {
    saveAs(blob, 'urls.csv')
  }

  // Google Analytics: Download links button events
  GAEvent('user page', 'download links button', 'successful')
  return null
}

export default {
  downloadUrls,
}
