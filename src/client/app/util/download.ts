import { saveAs } from 'file-saver'
import * as Sentry from '@sentry/react'
import rootActions from '../components/pages/RootPage/actions'
import userActions from '../../user/actions'
import useIsIE from '../components/BaseLayout/util/ie'
import { GAEvent } from './ga'

export const downloadUrls = async (urlCount: number, tableConfig: any) => {
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

  const limit = 100
  // gets 100 urls at a time
  const numOfGetRequests = Math.ceil(urlCount / limit)

  const getUrlsPromiseArray = []

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numOfGetRequests; i++) {
    const queryObj = {
      ...tableConfig,
      limit,
      offset: i * limit,
    }
    getUrlsPromiseArray.push(userActions.getUrls(queryObj))
  }

  await Promise.all(getUrlsPromiseArray).then((promises) => {
    // eslint-disable-next-line consistent-return
    promises.forEach((promise) => {
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
