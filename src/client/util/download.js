import { saveAs } from 'file-saver'
import rootActions from '~/actions/root'
import userActions from '~/actions/user'

export const downloadUrls = async (urlCount, tableConfig) => {
  const urlsArr = []
  // set headers to csv
  urlsArr.push(['Short URL', 'Original URL', 'Status', 'Visits', 'Created At', 'Last Modified\n'])

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
            shortUrl, longUrl, state, clicks, createdAt, updatedAt,
          } = url
          //  eslint-disable-next-line prefer-template
          urlsArr.push([shortUrl, longUrl, state, clicks, createdAt, updatedAt + '\n'])
        })
      } else if (!isOk && json) {
        rootActions.setErrorMessage(json.message)
        return null
      } else {
        rootActions.setErrorMessage('Error downloading urls.')
        return null
      }
    })
  })

  const blob = new Blob(urlsArr, { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'urls.csv')
  return null
}

export default {
  downloadUrls,
}
