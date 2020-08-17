import moment from 'moment-timezone'

import querystring, { ParsedUrlQueryInput } from 'querystring'
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
  SET_CREATE_SHORT_LINK_ERROR,
  SET_EDITED_CONTACT_EMAIL,
  SET_EDITED_DESCRIPTION,
  SET_EDITED_LONG_URL,
  SET_IS_UPLOADING,
  SET_LAST_CREATED_LINK,
  SET_LONG_URL,
  SET_RANDOM_SHORT_URL,
  SET_SHORT_URL,
  SET_UPLOAD_FILE_ERROR,
  SET_URL_FILTER,
  SET_URL_TABLE_CONFIG,
  SET_USER_MESSAGE,
  SetCreateShortLinkErrorAction,
  SetEditedContactEmailAction,
  SetEditedDescriptionAction,
  SetEditedLongUrlAction,
  SetIsUploadingAction,
  SetLastCreatedLinkAction,
  SetLongUrlAction,
  SetRandomShortUrlAction,
  SetShortUrlAction,
  SetUploadFileErrorAction,
  SetUrlFilterAction,
  SetUrlTableConfigAction,
  SetUserMessageAction,
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
  SetSuccessMessageAction,
} from '../root/types'
import {
  get,
  patch,
  patchFormData,
  postFormData,
  postJson,
} from '../../util/requests'
import rootActions from '../root'
import { generateShortUrl, removeHttpsProtocol } from '../../util/url'
import { isValidUrl } from '../../../shared/util/validation'
import { LOGIN_PAGE } from '../../util/types'
import {
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
  UrlType,
} from '../../reducers/user/types'
import { GetReduxState } from '../types'
import { GoGovReduxState } from '../../reducers/types'
import { MessageType } from '../../../shared/util/messages'

const isFetchingUrls: (payload: boolean) => IsFetchingUrlsAction = (
  payload,
) => ({
  type: IS_FETCHING_URLS,
  payload,
})

const setLastCreatedLink: (payload: string) => SetLastCreatedLinkAction = (
  payload,
) => ({
  type: SET_LAST_CREATED_LINK,
  payload,
})

const setIsUploading: (payload: boolean) => SetIsUploadingAction = (
  payload,
) => ({
  type: SET_IS_UPLOADING,
  payload,
})

const setEditedContactEmail: (
  shortUrl: string,
  editedContactEmail: string,
) => SetEditedContactEmailAction = (shortUrl, editedContactEmail) => ({
  type: SET_EDITED_CONTACT_EMAIL,
  payload: {
    shortUrl,
    editedContactEmail,
  },
})

const setEditedDescription: (
  shortUrl: string,
  editedDescription: string,
) => SetEditedDescriptionAction = (shortUrl, editedDescription) => ({
  type: SET_EDITED_DESCRIPTION,
  payload: {
    shortUrl,
    editedDescription,
  },
})

const setCreateShortLinkError: (
  payload: string | null,
) => SetCreateShortLinkErrorAction = (payload) => ({
  type: SET_CREATE_SHORT_LINK_ERROR,
  payload,
})

const setUploadFileError: (
  payload: string | null,
) => SetUploadFileErrorAction = (payload) => ({
  type: SET_UPLOAD_FILE_ERROR,
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

const setUrlFilter: (payload: UrlTableFilterConfig) => SetUrlFilterAction = (
  payload,
) => ({
  type: SET_URL_FILTER,
  payload,
})

const updateUrlCount: (urlCount: number) => UpdateUrlCountAction = (
  urlCount,
) => ({
  type: UPDATE_URL_COUNT,
  payload: urlCount,
})

const setUserMessage: (payload: string) => SetUserMessageAction = (
  payload,
) => ({ type: SET_USER_MESSAGE, payload })

const getUserMessage = (): ThunkAction<
  void,
  GoGovReduxState,
  void,
  UserActionType
> => async (dispatch: Dispatch<SetUserMessageAction>) => {
  const response = await get('/api/user/message')
  if (response.ok) {
    const text = await response.text()
    if (text) dispatch(setUserMessage(text))
  }
}

async function handleError(
  dispatch: Dispatch<
    | SetUploadFileErrorAction
    | SetCreateShortLinkErrorAction
    | SetErrorMessageAction
  >,
  response: Response,
) {
  const responseType = response.headers.get('content-type')
  let message: string
  let type: MessageType | undefined
  if (responseType?.includes('json')) {
    const json = await response.json()
    type = json.type
    message = json.message
  } else {
    message = await response.text()
  }
  message = message.replace('Error validating request body. ', '')
  switch (type) {
    case MessageType.FileUploadError:
      dispatch<SetUploadFileErrorAction>(setUploadFileError(message))
      break
    case MessageType.ShortUrlError:
      dispatch<SetCreateShortLinkErrorAction>(setCreateShortLinkError(message))
      break
    default:
      dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(message))
      break
  }
}

// retrieve urls based on query object
const getUrls: (
  queryObj: ParsedUrlQueryInput,
) => Promise<{
  json: { urls: Array<UrlType>; count: number; message?: string }
  isOk: boolean
}> = (queryObj) => {
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
    json.urls.forEach((url: UrlType) => {
      /* eslint-disable no-param-reassign */
      url.createdAt = moment(url.createdAt).tz('Singapore').format('D MMM YYYY')
      url.editedLongUrl = removeHttpsProtocol(url.longUrl)
      url.editedContactEmail = url.contactEmail
      url.editedDescription = url.description
      /* eslint-enable no-param-reassign */
    })
    dispatch<GetUrlsForUserSuccessAction>(isGetUrlsForUserSuccess(json.urls))
    dispatch<UpdateUrlCountAction>(updateUrlCount(json.count))
  } else {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage(json.message || 'Error fetching URLs'),
    )
  }
  dispatch<IsFetchingUrlsAction>(isFetchingUrls(false))
}

const resetUserState: () => ResetUserStateAction = () => ({
  type: RESET_USER_STATE,
})

const wipeUserState: () => WipeUserStateAction = () => ({
  type: WIPE_USER_STATE,
})

// API call to update long URL
const updateLongUrl = (shortUrl: string, longUrl: string) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetSuccessMessageAction
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

  return patch('/api/user/url', { longUrl, shortUrl }).then((response) => {
    if (response.ok) {
      dispatch<void>(getUrlsForUser())
      dispatch<SetSuccessMessageAction>(
        rootActions.setSuccessMessage('URL is updated.'),
      )
      return null
    }

    return response.json().then((json) => {
      dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

// API call to update description and contact email
const updateUrlInformation = (shortUrl: string) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetSuccessMessageAction
  >,
  getState: GetReduxState,
) => {
  const { user } = getState()
  const url = user.urls.filter(
    (urlToCheck) => urlToCheck.shortUrl === shortUrl,
  )[0]
  if (!url) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage('Url not found.'),
    )
    return null
  }
  return patch('/api/user/url', {
    contactEmail: url.editedContactEmail ? url.editedContactEmail : null,
    description: url.editedDescription,
    shortUrl,
  }).then((response) => {
    if (response.ok) {
      dispatch<void>(getUrlsForUser())
      dispatch<SetSuccessMessageAction>(
        rootActions.setSuccessMessage('URL is updated.'),
      )
      return null
    }

    return response.json().then((json) => {
      dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(json.message))
      return null
    })
  })
}

// API call to replace file
const replaceFile = (
  shortUrl: string,
  file: File,
  onError: (error: string) => void,
) => async (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetSuccessMessageAction | SetIsUploadingAction
  >,
) => {
  dispatch<SetIsUploadingAction>(setIsUploading(true))
  const data = new FormData()
  data.append('file', file, file.name)
  data.append('shortUrl', shortUrl)

  const response = await patchFormData('/api/user/url', data)
  dispatch<SetIsUploadingAction>(setIsUploading(false))
  if (!response.ok) {
    const json = await response.json()
    onError(json.message)
    return
  }

  dispatch<void>(getUrlsForUser())
  dispatch<SetSuccessMessageAction>(
    rootActions.setSuccessMessage('Your link has been updated.'),
  )
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

const toggleIsSearchable = (shortUrl: string, isSearchable: boolean) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetErrorMessageAction | SetSuccessMessageAction
  >,
) => {
  patch('/api/user/url', { shortUrl, isSearchable }).then((response) => {
    if (response.ok) {
      dispatch<void>(getUrlsForUser())
      dispatch<SetSuccessMessageAction>(
        rootActions.setSuccessMessage(
          `URL is now ${isSearchable ? '' : 'not'} searchable.`,
        ),
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

const urlCreated = (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    | CloseCreateUrlModalAction
    | ResetUserStateAction
    | SetSuccessMessageAction
    | SetLastCreatedLinkAction
  >,
  shortUrl: string,
) => {
  dispatch<void>(getUrlsForUser())
  dispatch<ResetUserStateAction>(resetUserState())
  const successMessage = 'Your link has been created'
  dispatch<SetLastCreatedLinkAction>(setLastCreatedLink(shortUrl))
  dispatch<SetSuccessMessageAction>(
    rootActions.setSuccessMessage(successMessage),
  )
}

//
/**
 * API call to create URL
 * If user is not logged in, the createUrl call returns unauthorized,
 * get them to login, else create the url.
 * @param history
 * @returns Promise<bool> Whether creation succeeded.
 */
const createUrlOrRedirect = (history: History) => async (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    | CloseCreateUrlModalAction
    | ResetUserStateAction
    | SetSuccessMessageAction
    | SetLastCreatedLinkAction
    | SetErrorMessageAction
  >,
  getState: GetReduxState,
) => {
  const { user } = getState()
  const { shortUrl } = user
  let { longUrl } = user

  // Test for malformed short URL
  if (!/^[a-z0-9-]/.test(shortUrl)) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage(
        'Short links should only consist of a-z, 0-9 and hyphens.',
      ),
    )
    return false
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
    return false
  }

  const response = await postJson('/api/user/url', { longUrl, shortUrl })

  if (!response.ok) {
    if (response.status === 401) {
      history.push(LOGIN_PAGE)
      return false
    }
    handleError(dispatch, response)
    return false
  }
  const json = await response.json()
  urlCreated(dispatch, json.shortUrl)
  return true
}

const transferOwnership = (
  shortUrl: string,
  newOwner: string,
  onSuccess: () => void,
) => (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    SetSuccessMessageAction | SetErrorMessageAction
  >,
) =>
  patch('/api/user/url/ownership', { shortUrl, newUserEmail: newOwner }).then(
    (response) => {
      if (response.ok) {
        onSuccess()
        dispatch<void>(getUrlsForUser())
        const successMessage = `Your link /${shortUrl} has been transferred to ${newOwner}`
        dispatch<SetSuccessMessageAction>(
          rootActions.setSuccessMessage(successMessage),
        )
      } else {
        // Otherwise, show error toast with relevant error message.
        response.json().then((json) => {
          dispatch<SetErrorMessageAction>(
            rootActions.setErrorMessage(json.message),
          )
        })
      }
    },
  )

/**
 * API call to upload a file.
 * @param file
 * @returns Promise<bool> Whether file upload succeeded.
 */
const uploadFile = (file: File) => async (
  dispatch: ThunkDispatch<
    GoGovReduxState,
    void,
    | CloseCreateUrlModalAction
    | ResetUserStateAction
    | SetSuccessMessageAction
    | SetLastCreatedLinkAction
    | SetErrorMessageAction
    | SetIsUploadingAction
  >,
  getState: GetReduxState,
) => {
  const {
    user: { shortUrl },
  } = getState()
  if (file == null) {
    dispatch<SetErrorMessageAction>(
      rootActions.setErrorMessage('File is missing.'),
    )
    return false
  }
  dispatch<SetIsUploadingAction>(setIsUploading(true))
  const data = new FormData()
  data.append('file', file, file.name)
  data.append('shortUrl', shortUrl)
  const response = await postFormData('/api/user/url', data)
  dispatch<SetIsUploadingAction>(setIsUploading(false))
  if (!response.ok) {
    await handleError(dispatch, response)
    return false
  }
  const json = await response.json()
  urlCreated(dispatch, json.shortUrl)
  return true
}

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
  uploadFile,
  setUrlTableConfig,
  getUrls,
  setUploadFileError,
  setCreateShortLinkError,
  setUrlFilter,
  replaceFile,
  toggleIsSearchable,
  setEditedContactEmail,
  setEditedDescription,
  getUserMessage,
  updateUrlInformation,
}
