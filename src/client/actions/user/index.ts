import moment from 'moment-timezone'

import querystring from 'querystring'
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { History } from 'history'
import { Dispatch } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import {
  CLOSE_CREATE_URL_MODAL,
  CloseCreateUrlModalAction,
  GET_URLS_FOR_USER_SUCCESS,
  GetUrlsForUserSuccessAction,
  IS_FETCHING_URLS,
  IsFetchingUrlsAction,
  OPEN_CREATE_URL_MODAL,
  OpenCreateUrlModalAction,
  RESET_USER_STATE,
  ResetUserStateAction,
  SET_EDITED_LONG_URL,
  SET_LONG_URL,
  SET_RANDOM_SHORT_URL,
  SET_SHORT_URL,
  SET_URL_TABLE_CONFIG,
  SetEditedLongUrlAction,
  SetLongUrlAction,
  SetRandomShortUrlAction,
  SetShortUrlAction,
  SetUrlTableConfigAction,
  TOGGLE_URL_STATE_SUCCESS,
  ToggleUrlStateSuccessAction,
  UPDATE_URL_COUNT,
  UpdateUrlCountAction,
  UserActionType,
  WIPE_USER_STATE,
  WipeUserStateAction,
} from './types'
import {
  RootActionType,
  SetErrorMessageAction,
  SetInfoMessageAction,
} from '../root/types'
import { get, patch, postJson } from '../../util/requests'
import rootActions from '../root'
import { generateShortUrl, removeHttpsProtocol } from '../../util/url'
import { isValidUrl } from '../../../shared/util/validation'
import { LOGIN_PAGE } from '../../util/types'
import {
  UrlState,
  UrlTableConfig,
  UrlType,
  UserState,
} from '../../reducers/user/types'
import { GetReduxState } from '../types'
import { GoGovReduxState } from '../../reducers/types'

const isFetchingUrls: (payload: boolean) => IsFetchingUrlsAction = (
  payload,
) => ({
  type: IS_FETCHING_URLS,
  payload,
})

const isGetUrlsForUserSuccess: (
  urls: Array<UrlType>,
) => GetUrlsForUserSuccessAction = (urls) => ({
  type: GET_URLS_FOR_USER_SUCCESS,
  payload: urls,
})

/**
 * Action to update multiple URL table properties.
 * @param {Array[key: string, value: string]} payload Array of array elements representing
 * key-value pairs for the tableConfig.
 * @example [ ['orderBy', 'shortUrl'], ['sortDirection', 'desc'] ]
 */
const setUrlTableConfig: (
  payload: UrlTableConfig,
) => SetUrlTableConfigAction = (payload) => ({
  type: SET_URL_TABLE_CONFIG,
  payload,
})

const updateUrlCount: (urlCount: number) => UpdateUrlCountAction = (
  urlCount,
) => ({
  type: UPDATE_URL_COUNT,
  payload: urlCount,
})

// retrieve urls based on query object
const getUrls: (queryObj: object) => any = (queryObj) => {
  const query = querystring.stringify(queryObj)

  return get(`/api/user/url?${query}`).then((response) => {
    const isOk = response.ok
    return response.json().then((json) => ({ json, isOk }))
  })
}

// retrieves urls based on url table config
const getUrlsForUser = (): ThunkAction<
  void,
  GoGovReduxState,
  void,
  UserActionType | RootActionType
> => async (
  dispatch: Dispatch<
    | IsFetchingUrlsAction
    | GetUrlsForUserSuccessAction
    | UpdateUrlCountAction
    | SetErrorMessageAction
  >,
  getState: GetReduxState,
) => {
  const state = getState()
  const { tableConfig } = state.user
  const {
    numberOfRows,
    pageNumber,
    sortDirection,
    orderBy,
    searchText,
    filter: { state: urlState, isFile },
  } = tableConfig
  const offset = pageNumber * numberOfRows

  const queryObj = {
    limit: numberOfRows,
    offset,
    orderBy,
    sortDirection,
    searchText,
    state: urlState,
    isFile,
  }

  dispatch<IsFetchingUrlsAction>(isFetchingUrls(true))
  const { json, isOk } = await getUrls(queryObj)

  if (isOk) {
    json.urls.forEach((url: any) => {
      url.updatedAt = moment(url.updatedAt) // eslint-disable-line no-param-reassign
        .tz('Singapore')
        .format('D MMM YYYY')
      // eslint-disable-next-line no-param-reassign
      url.editedLongUrl = removeHttpsProtocol(url.longUrl)
    })
    dispatch<GetUrlsForUserSuccessAction>(isGetUrlsForUserSuccess(json.urls))
    dispatch<UpdateUrlCountAction>(updateUrlCount(json.count))
  } else {
    dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(json.message))
  }
  dispatch<IsFetchingUrlsAction>(isFetchingUrls(false))
}

const resetUserState: () => ResetUserStateAction = () => ({
  type: RESET_USER_STATE,
})

const wipeUserState: () => WipeUserStateAction = () => ({
  type: WIPE_USER_STATE,
})

// API call to create URL
const createUrl = (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetInfoMessageAction | ResetUserStateAction
  >,
  user: UserState,
) => {
  const { shortUrl } = user
  let { longUrl } = user

  // Test for malformed short URL
  if (!/^[a-z0-9-]/.test(shortUrl)) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage(
        'Short links should only consist of a-z, 0-9 and hyphens.',
      ),
    )
    return Promise.reject()
  }

  // Append https:// as the protocol is stripped out
  // TODO: consider using Upgrade-Insecure-Requests header for HTTP
  if (!/^(http|https):\/\//.test(longUrl)) {
    longUrl = `https://${longUrl}` // eslint-disable-line no-param-reassign
  }

  if (!isValidUrl(longUrl)) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage('URL is invalid.'),
    )
    return Promise.reject()
  }

  return postJson('/api/user/url', { longUrl, shortUrl }).then((response) => {
    if (response.status === 401) {
      const error = new Error('Unauthorized')
      error.name = response.status.toString()
      return Promise.reject(error)
    }
    return response.json().then((json) => {
      if (response.status === 200) {
        dispatch<ResetUserStateAction>(resetUserState())
        dispatch<void>(getUrlsForUser())
        dispatch<SetInfoMessageAction>(
          rootActions.setInfoMessage(`New link created: ${json.shortUrl}`),
        )
        return Promise.resolve()
      }
      const error = new Error(json.message)
      error.name = response.status.toString()
      return Promise.reject(error)
    })
  })
}

// API call to update long URL
const updateLongUrl = (shortUrl: string, longUrl: string) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetInfoMessageAction
  >,
) => {
  // Append https:// as the protocol is stripped out
  // TODO: consider using Upgrade-Insecure-Requests header for HTTP
  if (!/^(http|https):\/\//.test(longUrl)) {
    longUrl = `https://${longUrl}` // eslint-disable-line no-param-reassign
  }

  if (!isValidUrl(longUrl)) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage('URL is invalid.'),
    )
    return null
  }

  return patch('/api/user/url/edit', { longUrl, shortUrl }).then((response) => {
    if (response.ok) {
      dispatch<void>(getUrlsForUser())
      dispatch<SetInfoMessageAction>(
        rootActions.setInfoMessage('URL is updated.'),
      )
      return null
    }

    return response.json().then((json) => {
      dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

// For setting short link value in the input box
const setShortUrl: (shortUrl: string) => SetShortUrlAction = (shortUrl) => ({
  type: SET_SHORT_URL,
  payload: shortUrl,
})

// For setting URL value in the input box
const setLongUrl: (longUrl: string) => SetLongUrlAction = (longUrl) => ({
  type: SET_LONG_URL,
  payload: removeHttpsProtocol(longUrl),
})

const setEditedLongUrl: (
  shortUrl: string,
  editedLongUrl: string,
) => SetEditedLongUrlAction = (shortUrl, editedLongUrl) => ({
  type: SET_EDITED_LONG_URL,
  payload: { shortUrl, editedLongUrl },
})

// For generating a random short URL
const setRandomShortUrl = () => (dispatch: Dispatch<SetRandomShortUrlAction>) =>
  generateShortUrl().then((randomUrl) => {
    dispatch<SetRandomShortUrlAction>({
      type: SET_RANDOM_SHORT_URL,
      payload: randomUrl,
    })
  })

const isToggleUrlStateSuccess: (payload: {
  shortUrl: string
  toState: UrlState
}) => ToggleUrlStateSuccessAction = (payload) => ({
  type: TOGGLE_URL_STATE_SUCCESS,
  payload,
})

// Toggle URL between active / inactive
const toggleUrlState = (shortUrl: string, state: UrlState) => (
  dispatch: Dispatch<UserActionType | RootActionType>,
) => {
  const toState =
    state === UrlState.Active ? UrlState.Inactive : UrlState.Active

  patch('/api/user/url', { shortUrl, state: toState }).then((response) => {
    if (response.ok) {
      dispatch<ToggleUrlStateSuccessAction>(
        isToggleUrlStateSuccess({ shortUrl, toState }),
      )
      return null
    }

    return response.json().then((json) => {
      dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

const openCreateUrlModal: () => OpenCreateUrlModalAction = () => ({
  type: OPEN_CREATE_URL_MODAL,
})

const closeCreateUrlModal: () => CloseCreateUrlModalAction = () => ({
  type: CLOSE_CREATE_URL_MODAL,
})

// If user is not logged in, the createUrl call returns unauthorized,
// get them to login, else create the url.
const createUrlOrRedirect = (history: History) => (
  dispatch: Dispatch<CloseCreateUrlModalAction | SetErrorMessageAction>,
  getState: GetReduxState,
) => {
  const { login, user } = getState()
  if (login.user.id) {
    return createUrl(dispatch, user)
      .then(() => {
        dispatch<CloseCreateUrlModalAction>(closeCreateUrlModal())
      })
      .catch((error) => {
        // Get user to login if the status is unauthorized
        if (error.name === 401) {
          // @ts-ignore
          history.push(LOGIN_PAGE)
        } else if (error.message) {
          dispatch<SetErrorMessageAction>(
            rootActions.setErrorMessage(error.message),
          )
        } else {
          dispatch<SetErrorMessageAction>(
            rootActions.setErrorMessage('An unknown error has occurred.'),
          )
          console.error(error)
        }
      })
  }

  // @ts-ignore
  history.push(LOGIN_PAGE)
  return null
}

const transferOwnership = (
  shortUrl: string,
  newOwner: string,
  onSuccess: () => void,
) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetInfoMessageAction | SetErrorMessageAction
  >,
) =>
  patch('/api/user/url/ownership', { shortUrl, newUserEmail: newOwner }).then(
    (response) => {
      if (response.ok) {
        onSuccess()
        dispatch<void>(getUrlsForUser())
        const successMessage = `Your link /${shortUrl} has been transferred to ${newOwner}`
        dispatch<SetInfoMessageAction>(
          rootActions.setInfoMessage(successMessage),
        )
      }
      // Otherwise, show error toast with relevant error message.
      response.json().then((json) => {
        dispatch<SetErrorMessageAction>(
          rootActions.setErrorMessage(json.message),
        )
      })
    },
  )

export default {
  getUrlsForUser,
  isFetchingUrls,
  createUrlOrRedirect,
  setShortUrl,
  setLongUrl,
  setEditedLongUrl,
  setRandomShortUrl,
  toggleUrlState,
  openCreateUrlModal,
  closeCreateUrlModal,
  transferOwnership,
  wipeUserState,
  resetUserState,
  updateLongUrl,
  updateUrlCount,
  setUrlTableConfig,
  getUrls,
}
