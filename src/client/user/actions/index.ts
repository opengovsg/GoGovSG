import moment from 'moment-timezone'

import querystring, { ParsedUrlQueryInput } from 'querystring'
import { History } from 'history'
import { Dispatch } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import * as Sentry from '@sentry/react'
import {
  CloseCreateUrlModalAction,
  GetLinkHistoryForUserSuccessAction,
  GetUrlsForUserSuccessAction,
  IsFetchingUrlsAction,
  OpenCreateUrlModalAction,
  ResetUserStateAction,
  SetCreateShortLinkErrorAction,
  SetEditedContactEmailAction,
  SetEditedDescriptionAction,
  SetEditedLongUrlAction,
  SetFileUploadStateAction,
  SetIsUploadingAction,
  SetLastCreatedLinkAction,
  SetLongUrlAction,
  SetRandomShortUrlAction,
  SetShortUrlAction,
  SetTagsAction,
  SetUploadFileErrorAction,
  SetUrlFilterAction,
  SetUrlTableConfigAction,
  SetUrlUploadStateAction,
  SetUserAnnouncementAction,
  SetUserMessageAction,
  ToggleUrlStateSuccessAction,
  UpdateUrlCountAction,
  UserAction,
  UserActionType,
  WipeUserStateAction,
} from './types'
import {
  RootActionType,
  SetErrorMessageAction,
  SetSuccessMessageAction,
} from '../../app/components/pages/RootPage/actions/types'
import {
  get,
  patch,
  patchFormData,
  postFormData,
  postJson,
} from '../../app/util/requests'
import rootActions from '../../app/components/pages/RootPage/actions'
import { generateShortUrl, removeHttpsProtocol } from '../../app/util/url'
import { isValidTags, isValidUrl } from '../../../shared/util/validation'
import { LOGIN_PAGE } from '../../app/util/types'
import {
  LinkChangeSet,
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
  UrlType,
} from '../reducers/types'
import { GetReduxState } from '../../app/actions/types'
import { GoGovReduxState } from '../../app/reducers/types'
import { MessageType } from '../../../shared/util/messages'
import { GAEvent } from '../../app/util/ga'

const setUrlUploadState: (payload: boolean) => SetUrlUploadStateAction = (
  payload,
) => ({
  type: UserAction.SET_URL_UPLOAD_STATE,
  payload,
})

const setFileUploadState: (payload: boolean) => SetFileUploadStateAction = (
  payload,
) => ({
  type: UserAction.SET_FILE_UPLOAD_STATE,
  payload,
})

const isFetchingUrls: (payload: boolean) => IsFetchingUrlsAction = (
  payload,
) => ({
  type: UserAction.IS_FETCHING_URLS,
  payload,
})

const setLastCreatedLink: (payload: string) => SetLastCreatedLinkAction = (
  payload,
) => ({
  type: UserAction.SET_LAST_CREATED_LINK,
  payload,
})

const setIsUploading: (payload: boolean) => SetIsUploadingAction = (
  payload,
) => ({
  type: UserAction.SET_IS_UPLOADING,
  payload,
})

const setEditedContactEmail: (
  shortUrl: string,
  editedContactEmail: string,
) => SetEditedContactEmailAction = (shortUrl, editedContactEmail) => ({
  type: UserAction.SET_EDITED_CONTACT_EMAIL,
  payload: {
    shortUrl,
    editedContactEmail,
  },
})

const setEditedDescription: (
  shortUrl: string,
  editedDescription: string,
) => SetEditedDescriptionAction = (shortUrl, editedDescription) => ({
  type: UserAction.SET_EDITED_DESCRIPTION,
  payload: {
    shortUrl,
    editedDescription,
  },
})

const setCreateShortLinkError: (
  payload: string,
) => SetCreateShortLinkErrorAction = (payload) => ({
  type: UserAction.SET_CREATE_SHORT_LINK_ERROR,
  payload,
})

const setUploadFileError: (payload: string) => SetUploadFileErrorAction = (
  payload,
) => ({
  type: UserAction.SET_UPLOAD_FILE_ERROR,
  payload,
})

const isGetUrlsForUserSuccess: (
  urls: Array<UrlType>,
) => GetUrlsForUserSuccessAction = (urls) => ({
  type: UserAction.GET_URLS_FOR_USER_SUCCESS,
  payload: urls,
})

/**
 * Action to update multiple URL table properties.
 * @param {Array[key: string, value: string]} payload Array of array elements representing
 * key-value pairs for the tableConfig.
 * @example [ ['orderBy', 'shortUrl'], ['sortDirection', 'desc'] ]
 */
const setUrlTableConfig: (
  payload: Partial<UrlTableConfig>,
) => SetUrlTableConfigAction = (payload) => ({
  type: UserAction.SET_URL_TABLE_CONFIG,
  payload,
})

const setUrlFilter: (payload: UrlTableFilterConfig) => SetUrlFilterAction = (
  payload,
) => ({
  type: UserAction.SET_URL_FILTER,
  payload,
})

const updateUrlCount: (urlCount: number) => UpdateUrlCountAction = (
  urlCount,
) => ({
  type: UserAction.UPDATE_URL_COUNT,
  payload: urlCount,
})

const setUserMessage: (payload: string) => SetUserMessageAction = (
  payload,
) => ({ type: UserAction.SET_USER_MESSAGE, payload })

const setUserAnnouncement: (payload: {
  message: string
  title: string
  subtitle: string
  url: string
  image: string
}) => SetUserAnnouncementAction = (payload) => ({
  type: UserAction.SET_USER_ANNOUNCEMENT,
  payload,
})

const getUserMessage =
  (): ThunkAction<void, GoGovReduxState, void, UserActionType> =>
  async (dispatch: Dispatch<SetUserMessageAction>) => {
    const response = await get('/api/user/message')
    if (response.ok) {
      const text = await response.text()
      if (text) dispatch(setUserMessage(text))
    }
  }

const getUserAnnouncement =
  (): ThunkAction<void, GoGovReduxState, void, UserActionType> =>
  async (dispatch: Dispatch<SetUserAnnouncementAction>) => {
    const response = await get('/api/user/announcement')
    if (response.ok) {
      const payload = await response.json()
      if (payload) dispatch(setUserAnnouncement(payload))
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

// retrieve linkHistory based on query object
const getLinkHistory: (queryObj: ParsedUrlQueryInput) => Promise<{
  json: {
    changes: Array<LinkChangeSet>
    totalCount: number
    offset: number
    limit: number
    message?: string
  }
  isOk: boolean
}> = async (queryObj) => {
  const query = querystring.stringify(queryObj)
  const response = await get(`/api/link-audit?${query}`)
  const isOk = response.ok
  const json = await response.json()
  return { json, isOk }
}

const isGetLinkHistoryForUserSuccess: (
  urls: Array<LinkChangeSet>,
  totalCount: number,
) => GetLinkHistoryForUserSuccessAction = (linkHistory, totalCount) => ({
  type: UserAction.GET_LINK_HISTORY_FOR_USER_SUCCESS,
  payload: {
    linkHistory,
    totalCount,
  },
})

const resetLinkHistory =
  (): ThunkAction<
    void,
    GoGovReduxState,
    void,
    UserActionType | RootActionType
  > =>
  async (
    dispatch: Dispatch<
      GetLinkHistoryForUserSuccessAction | SetErrorMessageAction
    >,
  ) => {
    dispatch<GetLinkHistoryForUserSuccessAction>(
      isGetLinkHistoryForUserSuccess([], 0),
    )
  }

// retrieves urls based on url table config
const getLinkHistoryForUser =
  (
    shortUrl: string,
    offset: number,
    limit: number,
  ): ThunkAction<
    void,
    GoGovReduxState,
    void,
    UserActionType | RootActionType
  > =>
  async (
    dispatch: Dispatch<
      GetLinkHistoryForUserSuccessAction | SetErrorMessageAction
    >,
  ) => {
    const queryObj = {
      limit,
      url: shortUrl,
      offset,
    }

    try {
      const { json, isOk } = await getLinkHistory(queryObj)
      if (!isOk) {
        throw new Error(json.message || 'Error fetching link history')
      }
      dispatch<GetLinkHistoryForUserSuccessAction>(
        isGetLinkHistoryForUserSuccess(json.changes, json.totalCount),
      )
    } catch (error) {
      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage(String(error)),
      )
    }
  }

// retrieve urls based on query object
const getUrls: (queryObj: ParsedUrlQueryInput) => Promise<{
  json: { urls: Array<UrlType>; count: number; message?: string }
  isOk: boolean
}> = async (queryObj) => {
  const query = querystring.stringify(queryObj)
  const response = await get(`/api/user/url?${query}`)
  const isOk = response.ok
  const json = await response.json()
  return { json, isOk }
}

// retrieves urls based on url table config, with search by either link or tags
const getUrlsForUser =
  (): ThunkAction<
    void,
    GoGovReduxState,
    void,
    UserActionType | RootActionType
  > =>
  async (
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
      isTag,
      numberOfRows,
      pageNumber,
      sortDirection,
      orderBy,
      searchText,
      filter: { state: urlState, isFile },
    } = tableConfig
    const offset = pageNumber * numberOfRows

    const baseQueryObj = {
      limit: numberOfRows,
      offset,
      orderBy,
      sortDirection,
      state: urlState,
      isFile,
    }
    // Search by either tags or link search text
    const queryObj = isTag
      ? { ...baseQueryObj, tags: searchText }
      : { ...baseQueryObj, searchText }

    dispatch<IsFetchingUrlsAction>(isFetchingUrls(true))
    try {
      const { json, isOk } = await getUrls(queryObj)
      if (!isOk) {
        throw new Error(json.message || 'Error fetching URLs')
      }
      json.urls.forEach((url: UrlType) => {
        /* eslint-disable no-param-reassign */
        url.createdAt = moment(url.createdAt)
          .tz('Singapore')
          .format('D MMM YYYY')
        url.editedLongUrl = removeHttpsProtocol(url.longUrl)
        url.editedContactEmail = url.contactEmail
        url.editedDescription = url.description
        /* eslint-enable no-param-reassign */
      })
      dispatch<GetUrlsForUserSuccessAction>(isGetUrlsForUserSuccess(json.urls))
      dispatch<UpdateUrlCountAction>(updateUrlCount(json.count))
    } catch (error) {
      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage(String(error)),
      )
    } finally {
      dispatch<IsFetchingUrlsAction>(isFetchingUrls(false))
    }
  }

const resetUserState: () => ResetUserStateAction = () => ({
  type: UserAction.RESET_USER_STATE,
})

const wipeUserState: () => WipeUserStateAction = () => ({
  type: UserAction.WIPE_USER_STATE,
})

// API call to update long URL
const updateLongUrl =
  (shortUrl: string, longUrl: string) =>
  (
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
        dispatch<SetErrorMessageAction>(
          rootActions.setErrorMessage(json.message),
        )
        return null
      })
    })
  }

// API call to update description and contact email
const updateUrlInformation =
  (shortUrl: string) =>
  (
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
        dispatch<SetErrorMessageAction>(
          rootActions.setErrorMessage(json.message),
        )
        return null
      })
    })
  }

// API call to replace file
const replaceFile =
  (shortUrl: string, file: File, onError: (error: string) => void) =>
  async (
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
  type: UserAction.SET_SHORT_URL,
  payload: shortUrl,
})

// For setting URL value in the input box
const setLongUrl: (longUrl: string) => SetLongUrlAction = (longUrl) => ({
  type: UserAction.SET_LONG_URL,
  payload: removeHttpsProtocol(longUrl),
})

const setEditedLongUrl: (
  shortUrl: string,
  editedLongUrl: string,
) => SetEditedLongUrlAction = (shortUrl, editedLongUrl) => ({
  type: UserAction.SET_EDITED_LONG_URL,
  payload: { shortUrl, editedLongUrl },
})

// For generating a random short URL
const setRandomShortUrl = () => (dispatch: Dispatch<SetRandomShortUrlAction>) =>
  generateShortUrl().then((randomUrl) => {
    dispatch<SetRandomShortUrlAction>({
      type: UserAction.SET_RANDOM_SHORT_URL,
      payload: randomUrl,
    })
  })

const isToggleUrlStateSuccess: (payload: {
  shortUrl: string
  toState: UrlState
}) => ToggleUrlStateSuccessAction = (payload) => ({
  type: UserAction.TOGGLE_URL_STATE_SUCCESS,
  payload,
})

// Toggle URL between active / inactive
const toggleUrlState =
  (shortUrl: string, state: UrlState) =>
  (dispatch: Dispatch<UserActionType | RootActionType>) => {
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
        dispatch<SetErrorMessageAction>(
          rootActions.setErrorMessage(json.message),
        )
        return null
      })
    })
  }

const openCreateUrlModal: () => OpenCreateUrlModalAction = () => ({
  type: UserAction.OPEN_CREATE_URL_MODAL,
})

const closeCreateUrlModal: () => CloseCreateUrlModalAction = () => ({
  type: UserAction.CLOSE_CREATE_URL_MODAL,
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

/**
 * API call to create URL
 * If user is not logged in, the createUrl call returns unauthorized,
 * get them to login, else create the url.
 * @param history
 * @param tags
 * @returns Promise<bool> Whether creation succeeded.
 */
const createUrlOrRedirect =
  (history: History) =>
  async (
    dispatch: ThunkDispatch<
      GoGovReduxState,
      void,
      | CloseCreateUrlModalAction
      | ResetUserStateAction
      | SetSuccessMessageAction
      | SetLastCreatedLinkAction
      | SetErrorMessageAction
      | SetUrlUploadStateAction
    >,
    getState: GetReduxState,
  ) => {
    const { user } = getState()
    const { shortUrl, tags } = user
    let { longUrl } = user

    // Test for malformed short URL
    if (!/^[a-z0-9-]/.test(shortUrl)) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with url unsuccessful')
      GAEvent('modal page', 'create link from url', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage(
          'Short links should only consist of a-z, 0-9 and hyphens.',
        ),
      )
      dispatch<SetUrlUploadStateAction>(setUrlUploadState(false))
      return
    }

    // Append https:// as the protocol is stripped out
    // TODO: consider using Upgrade-Insecure-Requests header for HTTP
    if (!/^(http|https):\/\//.test(longUrl)) {
      longUrl = `https://${longUrl}` // eslint-disable-line no-param-reassign
    }

    if (!isValidUrl(longUrl)) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with url unsuccessful')
      GAEvent('modal page', 'create link from url', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage('URL is invalid.'),
      )
      dispatch<SetUrlUploadStateAction>(setUrlUploadState(false))
      return
    }

    if (!isValidTags(tags)) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with url unsuccessful')
      GAEvent('modal page', 'create link from url', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage('Tags are invalid.'),
      )
      dispatch<SetUrlUploadStateAction>(setUrlUploadState(false))
      return
    }

    const response = await postJson('/api/user/url', {
      longUrl,
      shortUrl,
      tags,
    })

    if (!response.ok) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with url unsuccessful')
      GAEvent('modal page', 'create link from url', 'unsuccessful')

      if (response.status === 401) {
        history.push(LOGIN_PAGE)
        dispatch<SetUrlUploadStateAction>(setUrlUploadState(false))
      } else {
        handleError(dispatch, response)
        dispatch<SetUrlUploadStateAction>(setUrlUploadState(false))
      }
    } else {
      GAEvent('modal page', 'create link from url', 'successful')
      const json = await response.json()
      urlCreated(dispatch, json.shortUrl)
      dispatch<SetUrlUploadStateAction>(setUrlUploadState(true))
    }
  }

const transferOwnership =
  (shortUrl: string, newOwner: string, onSuccess: () => void) =>
  (
    dispatch: ThunkDispatch<
      GoGovReduxState,
      void,
      SetSuccessMessageAction | SetErrorMessageAction
    >,
  ) =>
    patch('/api/user/url/ownership', { shortUrl, newUserEmail: newOwner }).then(
      (response) => {
        if (response.ok) {
          // Google Analytics: Transfer ownership - success and shorturl are combined together to create unique actions
          GAEvent(
            'transfer link ownership',
            'successful',
            `/${shortUrl.toString()}`,
          )
          onSuccess()
          dispatch<void>(getUrlsForUser())
          const successMessage = `Your link /${shortUrl} has been transferred to ${newOwner}`
          dispatch<SetSuccessMessageAction>(
            rootActions.setSuccessMessage(successMessage),
          )
        } else {
          // Sentry analytics: transfer ownership fail
          Sentry.captureMessage('transfer ownership unsuccessful')
          GAEvent(
            'transfer link ownership',
            'unsuccessful',
            `/${shortUrl.toString()}`,
          )

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
const uploadFile =
  (file: File | null) =>
  async (
    dispatch: ThunkDispatch<
      GoGovReduxState,
      void,
      | CloseCreateUrlModalAction
      | ResetUserStateAction
      | SetSuccessMessageAction
      | SetLastCreatedLinkAction
      | SetErrorMessageAction
      | SetIsUploadingAction
      | SetFileUploadStateAction
    >,
    getState: GetReduxState,
  ) => {
    const {
      user: { shortUrl, tags },
    } = getState()
    if (file === null) {
      // Sentry analytics: create link with file fail
      Sentry.captureMessage('create link with file unsuccessful')
      GAEvent('modal page', 'create link from file', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage('File is missing.'),
      )
      dispatch<SetFileUploadStateAction>(setFileUploadState(false))
      return
    }

    if (!/^[a-z0-9-]/.test(shortUrl)) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with file unsuccessful')
      GAEvent('modal page', 'create link from file', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage(
          'Short links should only consist of a-z, 0-9 and hyphens.',
        ),
      )
      dispatch<SetFileUploadStateAction>(setFileUploadState(false))
      return
    }

    if (!isValidTags(tags)) {
      // Sentry analytics: create link with url fail
      Sentry.captureMessage('create link with file unsuccessful')
      GAEvent('modal page', 'create link from file', 'unsuccessful')

      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage('Tags are invalid.'),
      )
      dispatch<SetFileUploadStateAction>(setFileUploadState(false))
      return
    }

    dispatch<SetIsUploadingAction>(setIsUploading(true))
    const data = new FormData()
    data.append('file', file, file.name)
    data.append('shortUrl', shortUrl)
    tags.forEach((tag) => data.append('tags', tag))

    const response = await postFormData('/api/user/url', data)
    dispatch<SetIsUploadingAction>(setIsUploading(false))
    if (!response.ok) {
      // Sentry analytics: create link with file fail
      Sentry.captureMessage('create link with file unsuccessful')
      GAEvent('modal page', 'create link from file', 'unsuccessful')

      await handleError(dispatch, response)
      dispatch<SetFileUploadStateAction>(setFileUploadState(false))
    } else {
      GAEvent('modal page', 'create link from file', 'successful')
      const json = await response.json()
      urlCreated(dispatch, json.shortUrl)
      dispatch<SetFileUploadStateAction>(setFileUploadState(true))
    }
  }

// For setting tags value in the tags autocomplete input box
const setTags: (tags: string[]) => SetTagsAction = (tags) => ({
  type: UserAction.SET_TAGS,
  payload: tags,
})

// API call to update tags
const updateTags =
  (shortUrl: string, tags: string[]) =>
  (
    dispatch: ThunkDispatch<
      GoGovReduxState,
      void,
      SetErrorMessageAction | SetSuccessMessageAction
    >,
  ) => {
    if (!isValidTags(tags)) {
      dispatch<SetErrorMessageAction>(
        rootActions.setErrorMessage('Tags are invalid.'),
      )
      return null
    }

    return patch('/api/user/url', { shortUrl, tags }).then((response) => {
      if (response.ok) {
        dispatch<void>(getUrlsForUser())
        dispatch<SetSuccessMessageAction>(
          rootActions.setSuccessMessage('Tags are updated.'),
        )
        return null
      }

      return response.json().then((json) => {
        dispatch<SetErrorMessageAction>(
          rootActions.setErrorMessage(json.message),
        )
        return null
      })
    })
  }

export default {
  getUrlsForUser,
  getLinkHistoryForUser,
  resetLinkHistory,
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
  setEditedContactEmail,
  setEditedDescription,
  getUserMessage,
  getUserAnnouncement,
  updateUrlInformation,
  setFileUploadState,
  setUrlUploadState,
  setTags,
  updateTags,
}
