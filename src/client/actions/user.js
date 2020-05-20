import moment from 'moment-timezone'

import {
  CLOSE_CREATE_URL_MODAL,
  GET_URLS_FOR_USER_SUCCESS,
  OPEN_CREATE_URL_MODAL,
  RESET_USER_STATE,
  SET_EDITED_LONG_URL,
  SET_LONG_URL,
  SET_RANDOM_SHORT_URL,
  SET_SHORT_URL,
  SET_URL_TABLE_CONFIG,
  TOGGLE_URL_STATE_SUCCESS,
  UPDATE_URL_COUNT,
} from './types'
import { get, patch, postJson } from '../util/requests'
import rootActions from './root'
import { generateShortUrl, removeHttpsProtocol } from '../util/url'
import { isValidUrl } from '../../shared/util/validation'
import { LOGIN_PAGE } from '../util/types'

const querystring = require('querystring')

const isGetUrlsForUserSuccess = (urls) => ({
  type: GET_URLS_FOR_USER_SUCCESS,
  payload: urls,
})

/**
 * Action to update multiple URL table properties.
 * @param {Array[key: string, value: string]} payload Array of array elements representing
 * key-value pairs for the tableConfig.
 * @example [ ['orderBy', 'shortUrl'], ['sortDirection', 'desc'] ]
 */
const setUrlTableConfig = (payload) => ({
  type: SET_URL_TABLE_CONFIG,
  payload,
})

const updateUrlCount = (urlCount) => ({
  type: UPDATE_URL_COUNT,
  payload: urlCount,
})

// retrieve urls based on query object
const getUrls = (queryObj) => {
  const query = querystring.stringify(queryObj)

  return get(`/api/user/url?${query}`).then((response) => {
    const isOk = response.ok
    return response.json().then((json) => ({ json, isOk }))
  })
}

// retrieves urls based on url table config
const getUrlsForUser = () => async (dispatch, getState) => {
  const state = getState()
  const { tableConfig } = state.user
  const {
    numberOfRows,
    pageNumber,
    sortDirection,
    orderBy,
    searchText,
  } = tableConfig
  const offset = pageNumber * numberOfRows

  const queryObj = {
    limit: numberOfRows,
    offset,
    orderBy,
    sortDirection,
    searchText,
  }

  const { json, isOk } = await getUrls(queryObj)

  if (isOk) {
    json.urls.forEach((url) => {
      url.updatedAt = moment(url.updatedAt) // eslint-disable-line no-param-reassign
        .tz('Singapore')
        .format('D MMM YYYY')
      // eslint-disable-next-line no-param-reassign
      url.editedLongUrl = removeHttpsProtocol(url.longUrl)
    })
    dispatch(isGetUrlsForUserSuccess(json.urls))
    dispatch(updateUrlCount(json.count))
  } else {
    dispatch(rootActions.setErrorMessage(json.message))
  }
  return null
}

const resetUserState = () => ({
  type: RESET_USER_STATE,
})

// API call to create URL
const createUrl = (dispatch, user) => {
  const { shortUrl } = user
  let { longUrl } = user

  // Test for malformed short URL
  if (!/^[a-z0-9-]/.test(shortUrl)) {
    dispatch(
      rootActions.setErrorMessage(
        'Short links should only consist of a-z, 0-9 and hyphens.',
      ),
    )
    return null
  }

  // Append https:// as the protocol is stripped out
  // TODO: consider using Upgrade-Insecure-Requests header for HTTP
  if (!/^(http|https):\/\//.test(longUrl)) {
    longUrl = `https://${longUrl}` // eslint-disable-line no-param-reassign
  }

  if (!isValidUrl(longUrl)) {
    dispatch(rootActions.setErrorMessage('URL is invalid.'))
    return null
  }

  return postJson('/api/user/url', { longUrl, shortUrl }).then((response) => {
    if (response.status === 401) {
      const error = new Error('Unauthorized')
      error.name = response.status
      return Promise.reject(error)
    }
    return response.json().then((json) => {
      if (response.status === 200) {
        dispatch(resetUserState())
        dispatch(getUrlsForUser())
        dispatch(
          rootActions.setInfoMessage(`New link created: ${json.shortUrl}`),
        )
        return Promise.resolve()
      }
      const error = new Error(json.message)
      error.name = response.status
      return Promise.reject(error)
    })
  })
}

// API call to update long URL
const updateLongUrl = (shortUrl, longUrl) => (dispatch) => {
  // Append https:// as the protocol is stripped out
  // TODO: consider using Upgrade-Insecure-Requests header for HTTP
  if (!/^(http|https):\/\//.test(longUrl)) {
    longUrl = `https://${longUrl}` // eslint-disable-line no-param-reassign
  }

  if (!isValidUrl(longUrl)) {
    dispatch(rootActions.setErrorMessage('URL is invalid.'))
    return null
  }

  return patch('/api/user/url/edit', { longUrl, shortUrl }).then((response) => {
    if (response.ok) {
      dispatch(getUrlsForUser())
      dispatch(rootActions.setInfoMessage('URL is updated.'))
      return null
    }

    return response.json().then((json) => {
      dispatch(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

// For setting short link value in the input box
const setShortUrl = (shortUrl) => ({
  type: SET_SHORT_URL,
  payload: shortUrl,
})

// For setting URL value in the input box
const setLongUrl = (longUrl) => ({
  type: SET_LONG_URL,
  payload: removeHttpsProtocol(longUrl),
})

const setEditedLongUrl = (shortUrl, editedLongUrl) => ({
  type: SET_EDITED_LONG_URL,
  payload: { shortUrl, editedLongUrl },
})

// For generating a random short URL
const setRandomShortUrl = () => (dispatch) =>
  generateShortUrl().then((randomUrl) => {
    dispatch({
      type: SET_RANDOM_SHORT_URL,
      payload: randomUrl,
    })
  })

const isToggleUrlStateSuccess = (payload) => ({
  type: TOGGLE_URL_STATE_SUCCESS,
  payload,
})

// Toggle URL between active / inactive
const toggleUrlState = (shortUrl, state) => (dispatch) => {
  const toState = state === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

  patch('/api/user/url', { shortUrl, state: toState }).then((response) => {
    if (response.ok) {
      dispatch(isToggleUrlStateSuccess({ shortUrl, toState }))
      return null
    }

    return response.json().then((json) => {
      dispatch(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

const openCreateUrlModal = () => ({
  type: OPEN_CREATE_URL_MODAL,
})

const closeCreateUrlModal = () => ({
  type: CLOSE_CREATE_URL_MODAL,
})

// If user is not logged in, the createUrl call returns unauthorized,
// get them to login, else create the url.
const createUrlOrRedirect = (history) => (dispatch, getState) => {
  const { login, user } = getState()
  if (login.user.id) {
    return createUrl(dispatch, user)
      .then(() => {
        dispatch(closeCreateUrlModal())
      })
      .catch((error) => {
        // Get user to login if the status is unauthorized
        if (error.name === 401) {
          history.push(LOGIN_PAGE)
        } else if (error.message) {
          dispatch(rootActions.setErrorMessage(error.message))
        } else {
          dispatch(
            rootActions.setErrorMessage('An unknown error has occurred.'),
          )
          console.error(error)
        }
      })
  }

  history.push(LOGIN_PAGE)
  return null
}

const transferOwnership = (shortUrl, newOwner) => (dispatch) =>
  patch('/api/user/url/ownership', { shortUrl, newUserEmail: newOwner }).then(
    (response) => {
      if (response.ok) {
        dispatch(getUrlsForUser())
        const successMessage = `Your link /${shortUrl} has been transferred to ${newOwner}`
        return dispatch(rootActions.setInfoMessage(successMessage))
      }
      // Otherwise, show error toast with relevant error message.
      return response.json().then((json) => {
        dispatch(rootActions.setErrorMessage(json.message))
      })
    },
  )

export default {
  getUrlsForUser,
  createUrlOrRedirect,
  setShortUrl,
  setLongUrl,
  setEditedLongUrl,
  setRandomShortUrl,
  toggleUrlState,
  openCreateUrlModal,
  closeCreateUrlModal,
  transferOwnership,
  resetUserState,
  updateLongUrl,
  updateUrlCount,
  setUrlTableConfig,
  getUrls,
}
