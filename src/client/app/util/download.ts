import { saveAs } from 'file-saver'
import * as Sentry from '@sentry/react'
import rootActions from '../components/pages/RootPage/actions'
import userActions from '../../user/actions'
import useIsIE from '../components/BaseLayout/util/ie'
import { GAEvent } from './ga'
import { UrlTableConfig } from '../../user/reducers/types'
import queryObjFromTableConfig from '../helpers/urlQueryHelper'
import { BULK_UPLOAD_HEADER } from '../../../shared/constants'

export const downloadCsv = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], {
    type: 'text/csv;charset=utf-8',
  })

  if (useIsIE()) {
    // @ts-ignore: `msSaveBlob` used for old IE versions has been removed as of TypeScript 4.4
    navigator.msSaveBlob(blob, filename)
  } else {
    saveAs(blob, filename)
  }
}

export const downloadSampleBulkCsv = () => {
  const headers = BULK_UPLOAD_HEADER
  const body = ['https://www.link1.com', 'https://www.link2.com']
  const content = [headers, ...body].join('\r\n')
  downloadCsv(content, 'sample_bulk.csv')
  GAEvent('modal page', 'downloaded bulk sample', 'successful')
}

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
  const { json, isOk } = await userActions.getUrls(queryObj)
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
  downloadCsv(urlsArr.join(''), 'urls.csv')

  // Google Analytics: Download links button events
  GAEvent('user page', 'download links button', 'successful')
  return null
}

export default {
  downloadSampleBulkCsv,
  downloadUrls,
}
